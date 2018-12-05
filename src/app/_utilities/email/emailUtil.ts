export class EmailUtil {
    /*
        Regular expresion for email validation. The Email consists of 3 parts: name, company and domain.
        name => (alphanumeric, at least 1 char), validation = [a-zA-Z0-9_.+-]{1}
        company => (alphanumeric, at least 1 char), validation = [a-zA-Z0-9_.+-]{1}
        domain => (alphanumeric, at least 2 char), validation = [a-zA-Z0-9_.+-]{2}
    */
    public static EMAIL_REG_EXP = /^([a-zA-Z0-9_.+-]{1})+@([a-zA-Z0-9-]{1})+\.([a-zA-Z0-9-.]{2,})+$/;
    
    public static isValid(value: string) {
        return (value && EmailUtil.EMAIL_REG_EXP.test(value));
    }
}