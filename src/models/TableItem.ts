export class TableItem {
    ColSpan: number;
    RowSpan: number;
    IsLegend: boolean;
    Content: string | undefined;

    constructor (colSpan: number, rowSpan: number, isLegend: boolean, content: string | undefined) {
        this.ColSpan = colSpan;
        this.RowSpan = rowSpan;
        this.IsLegend = isLegend;
        this.Content = content;
    }
}