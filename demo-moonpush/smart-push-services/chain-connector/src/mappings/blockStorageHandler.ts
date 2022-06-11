import { SubstrateBlock } from "@subql/types";
import { SubstrateBlockEntity } from "../types";


export async function handleBlockStorage(block: SubstrateBlock): Promise<SubstrateBlockEntity> {
  let blockNumber = Number(block.block.header.number);

  //SubstrateBlockEntity
  let blockEntity = new SubstrateBlockEntity(`${blockNumber}`);
  blockEntity.block_number = blockNumber;
  blockEntity.timestamp = block.timestamp;
  blockEntity.hash = block.block.hash.toString();
  blockEntity.runtime_version = block.specVersion;
  blockEntity.created_at = new Date();
  return blockEntity;
}


