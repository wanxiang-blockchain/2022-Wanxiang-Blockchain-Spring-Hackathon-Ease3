export class GasType {
    gas_price: bigint;
    gas_type: string;
    static LEGACY: string = 'legacy';
    static EIP2930: string = 'EIP-2930';
    static EIP1599: string = 'EIP-1599';
}