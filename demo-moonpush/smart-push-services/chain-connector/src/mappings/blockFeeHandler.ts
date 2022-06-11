import { SubstrateBlock } from "@subql/types";
import { DispatchInfo } from "@polkadot/types/interfaces";
import { BlockFee } from "../types";
import { JSONStringifyExt } from "../support/utils";
import { ParachainConstants } from "../constants";
import { GasType } from "../support/gasType";



export async function handleBlockFee(block: SubstrateBlock): Promise<BlockFee> {
  let fees_susbtrate = BigInt(0);
  let fees_evm = BigInt(0);

  let maxGasFeeOnEVM = BigInt(0);
  let blockNumber = Number(block.block.header.number);
  for (let index = 0; index < block.block.extrinsics.length; index++) {
    let fee = BigInt(0);
    const extrinsic = block.block.extrinsics[index];
    let section = extrinsic.method.section.toString();
    let method = extrinsic.method.method.toString();
    logger.debug(
      `blockNum ${blockNumber} ${section}.${method}`
    );

    // Retrieve the event for the extrinsic info
    const { event } = block.events.find(
      ({ phase, event }) =>
        phase.isApplyExtrinsic &&
        phase.asApplyExtrinsic.eq(index) &&
        event.section === ParachainConstants.SECTION_SYSTEM &&
        (event.method === ParachainConstants.METHOD_EXTRINSIC_SUCCESS || event.method === ParachainConstants.METHOD_EXTRINSIC_FAILED)
    );
    const extrinsic_success: boolean = event.method === ParachainConstants.METHOD_EXTRINSIC_SUCCESS;
    if (section == ParachainConstants.SECTION_ETHEREUM) {

      // For Ethereum transaction, we take the gas used * gas price
      // 1 gas is 25000 weight in current implementation;

      // Retrieve the dispatch info (where the used weight is stored) from the type of event
      const dispatchInfo = extrinsic_success ? (event.data[0] as DispatchInfo) : (event.data[1] as DispatchInfo);
      // logger.debug(
      //   `blockNum ${blockNumber} dispatchInfo: ${JSONStringifyExt(dispatchInfo)}`
      // );
      let argInfo: any = (extrinsic.method.args[0] as any).toJSON();

      let gasPrice = getGasPrice(blockNumber, argInfo);

      fee = dispatchInfo.weight.toBigInt() * gasPrice.gas_price / BigInt(ParachainConstants.GAS_WEIGHT);
      if (fee > maxGasFeeOnEVM) {
        maxGasFeeOnEVM = fee;
      }
      fees_evm += fee;
    } else if (!extrinsic.signer.isEmpty) {

      //judge if need pay gas at current extrinsic
      let needPayGas: boolean = judgeNeedPayGasAtExtrinsic(extrinsic_success, section, method);

      if (needPayGas) {
        // For Substrate transaction, we only take signed transaction
        // we rely on the node payment calculation
        const paymentDetails = await api.rpc.payment.queryInfo(
          extrinsic.toHex(),
          block.block.header.parentHash
        );

        fee = (paymentDetails.partialFee.toBigInt());
        fees_susbtrate += fee;
        logger.debug(
          `blockNum ${blockNumber} partialFee:${fee}, paymentDetails: ${JSONStringifyExt(paymentDetails)}`
        );
      } else {
        logger.debug(
          `blockNum ${blockNumber} no need to pay gas fee`
        );
      }
    }
  }
  let totalFees = fees_evm + fees_susbtrate;
  if (totalFees > BigInt(0)) {

    let totalBurnt = (totalFees * BigInt(ParachainConstants.BURNT_PERCENT)) / BigInt(100);
    let totalTreasury = (totalFees * BigInt(ParachainConstants.TREASURY_PERCENT)) / BigInt(100);

    let bf = new BlockFee(blockNumber.toString());
    bf.blockNumber = blockNumber;
    bf.fees = totalFees.toString();
    bf.burnt = totalBurnt.toString();
    bf.to_treasury = totalTreasury.toString();
    bf.timestamp = block.timestamp;
    bf.max_gasfee_on_evm = maxGasFeeOnEVM.toString();
    bf.fees_evm = fees_evm.toString();
    bf.fees_substrate = fees_susbtrate.toString();
    logger.debug(
      `blockNumber fee ${blockNumber} ${JSONStringifyExt(bf)}`
    );
    return bf;
  }
}

function getGasPrice(blockNumber: any, argInfo: any): GasType {
  // Runtime 1200 方法参数升级结构, 增加了Legacy这一层
  // 1471037， 这个是 Moonriver， 1103 => 1201
  // 415946，这个是 Moonbeam，1103 => 1201 
  //  大概率对的快速版本。
  // transaction.type=0，就是legacy，然后按照老的处理就行了，gas_price就是gas_price,  然后  总的8：2 分给 burn/treasury
  // transaction.type=1,   就是EIP-2930，同上，关于gas_price， 然后  总的8：2 分给 burn/treasury
  // transaction.type=2,   就是 EIP-1599， max_fee_per_gas就是 gas_price, 8：2 分给 burn/treasury ;   max_priority_fee_per_gas 是多出来的，直接给到 block_author的，但你不用管它，balance event会 “照顾” 它的

  // logger.debug(
  //   `blockNum ${blockNumber} argInfo: ${JSONStringifyExt(argInfo)}`
  // );
  let gasPrice: GasType = { gas_price: BigInt(0), gas_type: GasType.LEGACY };

  if (argInfo.gasPrice) {
    gasPrice.gas_price = BigInt(argInfo.gasPrice);
  }

  if (argInfo.legacy && argInfo.legacy.gasPrice) {
    gasPrice.gas_price = BigInt(argInfo.legacy.gasPrice);
  }

  if (argInfo.eip2930 && argInfo.eip2930.gasPrice) {
    gasPrice.gas_price = BigInt(argInfo.eip2930.gasPrice);
    gasPrice.gas_type = GasType.EIP2930;
  }

  if (argInfo.eip1559 && argInfo.eip1559.maxFeePerGas) {
    gasPrice.gas_price = BigInt(argInfo.eip1559.maxFeePerGas);
    gasPrice.gas_type = GasType.EIP1599;
  }

  logger.debug(
    `blockNum ${blockNumber} gasPrice: ${gasPrice}`
  );

  return gasPrice;
}


function judgeNeedPayGasAtExtrinsic(extrinsic_success: boolean, section: string, method: string) {

  // 判断是否 extrinsic success，如果是，看是否要被过滤，如果不是，正常算（因为fail了一定有手续费）
  if (!extrinsic_success) {
    return true;
  }

  if (section === "sudo") {
    return false;
  }
  if (ParachainConstants.EXTRINSIC_IGNORE_PAY_GAS_NAMES.indexOf(section + "." + method) >= 0) {
    return false;
  }
  return true;
}
