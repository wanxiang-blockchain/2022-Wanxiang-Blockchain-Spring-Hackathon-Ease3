import { SubstrateExtrinsic } from "@subql/types";
import { SubstrateEventEntity, SubstrateExtrinsicEntity } from "../types";
import { getID, JSONStringifyExt } from "../support/utils";
import { ParachainConstants } from "../constants";


export async function handleSubstrateExtrinsic(extrinsic: SubstrateExtrinsic): Promise<SubstrateExtrinsicEntity> {
  let blockNumber = Number(extrinsic.block.block.header.number);

  let section = extrinsic.extrinsic.method.section.toString();
  let method = extrinsic.extrinsic.method.method.toString();

  //SubstrateExtrinsicEntity
  let extrinsicEntity = new SubstrateExtrinsicEntity(`${blockNumber}-${getID()}`);

  extrinsicEntity.block_number = blockNumber;
  extrinsicEntity.index_in_block = extrinsic.idx;

  extrinsicEntity.section = section;
  extrinsicEntity.method = method;
  extrinsicEntity.name = section + '.' + method;
  extrinsicEntity.args = JSONStringifyExt(extrinsic.extrinsic.args);

  extrinsicEntity.signer = extrinsic.extrinsic.signer.toString();
  extrinsicEntity.signature = extrinsic.extrinsic.signature.toString();
  extrinsicEntity.hash = extrinsic.extrinsic.hash.toString();
  extrinsicEntity.created_at = new Date();
  extrinsicEntity.timestamp = extrinsic.block.timestamp;

  return extrinsicEntity;
}


export async function handleSubstrateEvent(extrinsic: SubstrateExtrinsic): Promise<SubstrateEventEntity[]> {
  let blockNumber = Number(extrinsic.block.block.header.number);

  let eventEntities: SubstrateEventEntity[] = [];
  let extrinsicEntityId = `${blockNumber}-${getID()}`;

  let events = extrinsic.events;
  if (!events) {
    return eventEntities;
  }
  for (let i = 0; i < events.length; i++) {
    let eventItem = events[i];
    if (!eventItem.event) {
      continue;
    }
    let evt_method = eventItem.event.method;
    let evt_section = eventItem.event.section;

    logger.debug(`handleSubstrateEvent blockNumber: ${blockNumber} section.method: ${evt_section}.${evt_method}`);

    let eventEntity = new SubstrateEventEntity(`${blockNumber}-${getID()}`);

    eventEntity.block_number = blockNumber;
    eventEntity.extrinsic_id = extrinsicEntityId;
    eventEntity.index_in_extrinsic = i;

    eventEntity.section = evt_section;
    eventEntity.method = evt_method;
    eventEntity.name = evt_section + '.' + evt_method;


    if (eventItem.event.data) {
      let dataJson = eventItem.event.data.toJSON();
      eventEntity.data = JSONStringifyExt(dataJson);

      if (evt_section === ParachainConstants.EVM && evt_method === ParachainConstants.EVM_LOG) {
        if (dataJson) {
          eventEntity.evm_contract_address = dataJson[0].address;
          let topics = dataJson[0].topics;
          if (topics) {
            // logger.info(` topics[0] ${topics[0]} `);
            eventEntity.evm_method_hash = topics[0];
          }
        }
      }
    }
    eventEntity.created_at = new Date();
    eventEntity.timestamp = extrinsic.block.timestamp;

    eventEntities.push(eventEntity);
  }

  return eventEntities;
}


