import IDValidator from './IDValidator'; 
class IDValidatorExt extends IDValidator {

    isValid(id) {
        if (!super.isValid(id)){
            return false;
        }
        return true; 
    }
}

export default new IDValidatorExt();
