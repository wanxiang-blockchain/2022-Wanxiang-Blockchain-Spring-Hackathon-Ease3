import { Injectable } from "@nestjs/common";   
import { ITriggerWorker } from "../trigger.worker";
import { BlockWorker } from "./block.worker";
@Injectable()
export class BlockExtrinsicWorker extends BlockWorker implements ITriggerWorker {

}

