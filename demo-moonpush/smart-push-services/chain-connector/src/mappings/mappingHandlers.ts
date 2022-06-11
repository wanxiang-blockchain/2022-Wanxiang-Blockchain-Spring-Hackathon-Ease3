import { SubstrateBlock, SubstrateExtrinsic } from "@subql/types";
import { handleBlockFee } from "./blockFeeHandler";
import { handleBlockStorage } from "./blockStorageHandler";
import { handleSubstrateEvent, handleSubstrateExtrinsic } from "./blockExtrinsicHandler";
import { ParachainConstants } from "../constants";
import { publish } from "./publishHandler";
import { PublishMessageKey } from "../support/publishMessage";


export async function handleBlock(block: SubstrateBlock): Promise<void> {
  let blockNumber = block.block.header.number.toBigInt();
  logger.info(`handleBlock blockNumber: ${blockNumber}`);

  let blockFee = await handleBlockFee(block);

  let blockEntity = await handleBlockStorage(block);
  await publish({ key: PublishMessageKey.BLOCK, data: [blockEntity, blockFee] });
  logger.info(`published block at ${blockNumber}`);

}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  let blockNumber = extrinsic.block.block.header.number.toBigInt();

  let section = extrinsic.extrinsic.method.section.toString();
  let method = extrinsic.extrinsic.method.method.toString();
  if (ignoreExtrinsic(section, method)) {
    return;
  }
  logger.info(`handleCall blockNumber: ${blockNumber} section.method: ${section}.${method}`);

  let extrinsicEntity = await handleSubstrateExtrinsic(extrinsic);
  let extrinsicEventEntities = await handleSubstrateEvent(extrinsic);

  await publish({ key: PublishMessageKey.EXTRINSIC, data: [extrinsicEntity, extrinsicEventEntities] });

  logger.info(`published extrinsic at ${blockNumber}`);
}

function ignoreExtrinsic(section: string, method: string) {

  if (ParachainConstants.EXTRINSIC_IGNORE_SAVE_NAMES.indexOf(section + "." + method) >= 0) {
    return true;
  }
  return false;
}
