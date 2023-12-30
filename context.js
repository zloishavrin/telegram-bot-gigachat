class Context {

    constructor (context = []) {
        this.context = context;
    }

    setContext(id, message) {
        for(let index = 0; index < this.context.length; index++) {
            if(this.context[index].id == id) {
                this.context.message = message
                return;
            }
        }
        this.context.push({
            id: id,
            message: message
        });
    }

    getContext(id) {
        for(let index = 0; index < this.context.length; index++) {
            if(this.context[index].id == id) {
                return this.context[index].message;
            }
        }
        return false;
    }

}

module.exports = {
    Context: Context
}