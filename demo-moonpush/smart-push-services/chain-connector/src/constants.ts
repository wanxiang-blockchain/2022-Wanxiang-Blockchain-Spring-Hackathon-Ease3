export class ParachainConstants {
    static CHAIN_NAME: string = 'Moonriver';
    static DATA_SERIVE_HOST_PORT: number = 10000;
    static DATA_SERIVE_HOST_NAME: string = '16.163.5.216';
    static DATA_SERIVE_ENDPOINT: string = '/api/v1/publish_data';
   
    static BURNT_PERCENT: number = 80;
    static TREASURY_PERCENT: number = 20;
    static GAS_WEIGHT: number = 25000;

    static SECTION_ETHEREUM: string = 'ethereum';
    static METHOD_EXTRINSIC_FAILED: string = "ExtrinsicFailed";
    static METHOD_EXTRINSIC_SUCCESS: string = "ExtrinsicSuccess";
    static SECTION_SYSTEM: string = "system";

    static EVM: string = "evm";
    static EVM_LOG: string = "Log";

    static EXTRINSIC_IGNORE_SAVE_NAMES: string[] = [
        // "parachainSystem.setValidationData",
        // "timestamp.set",
        // "authorInherent.setAuthor",
        // "authorInherent.kickOffAuthorshipValidation"
    ];

    static EXTRINSIC_IGNORE_PAY_GAS_NAMES: string[] = [
        "babe.reportEquivocation",
        "babe.reportEquivocationUnsigned",
        "contracts.removeCode",
        "democracy.noteImminentPreimage",
        "democracy.noteImminentPreimageOperational",
        "grandpa.reportEquivocation",
        "grandpa.reportEquivocationUnsigned",
        "staking.reapStash",
        "parachainSystem.setValidationData",
        "parachainSystem.enactAuthorizedUpgrade",
        "authority.triggerCall",
        "oracle.feedValues"
    ];// refer to : https://litentry.notion.site/Web3Go-TransactionFee-exclude-list-ddb94a63124848188a62e063e77c32ef




}