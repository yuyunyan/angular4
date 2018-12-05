export class NumberUtil {

    static isPriceValid(input: string | number) {
        if (input < 0 || input == 0) {
            return false;
        } else {
            let value = String(Number(input));
            const priceCostRegex = /^\d+(\.\d{0,})?$/;
            return priceCostRegex.test(value);
        }
    }

    static formatPrice(input: number) {
        if (input == undefined || input == null) {
            return '0.00';
        }
        let numberString = input + "";
        let sections = numberString.split(".");
        if (sections.length == 1) {
            return input + '.00';
        }
        if (sections[1].length == 1) {
            return input + '0';
        }
        if (sections[1].length > 5) {
            return sections[0] + '.' + sections[1].substr(0, 5);
        }
        return input;

    }
}