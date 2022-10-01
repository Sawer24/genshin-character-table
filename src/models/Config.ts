import type { TableLegend } from "./Data";

export class Config {
    Cols:  Array<TableLegend>;
    Rows: Array<TableLegend>;

    constructor (cols: Array<TableLegend>, rows: Array<TableLegend>) {
        this.Cols = cols;
        this.Rows = rows;
    }
}
