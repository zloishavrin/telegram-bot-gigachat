const fs = require('fs/promises');

class DB {

    constructor (dbPath = './db.json') {
        this.dbPath = dbPath;
    }

    async readUserData() {
        const data = await fs.readFile(this.dbPath, 'utf-8');
        const userData = JSON.parse(data);
        return userData.users;
    }
    
    async writeUserData(users) {
        const newUsersObject = {
            "users": users
        }
        const newJSONFile = JSON.stringify(newUsersObject, null, 4);
        await fs.writeFile(this.dbPath, newJSONFile);
    }

    async checkNewUser(id) {
        const userData = await this.readUserData();
        for(let index = 0; index < userData.length; index++) {
            if(userData[index].id == id) {
                return false;
            }
            if(index == userData.length - 1) {
                return true;
            }
        }
    }
    
    async addNewUser(id) {
        const userData = await this.readUserData();
        const newUser = {
            "id": id,
            "dateRegistry": new Date(),
            "req": "Привет! Кто ты?",
            "completion": "Привет! Я Shaligula Aide!"
        }
    
        userData.push(newUser);
        await this.writeUserData(userData);
    }

    async getUserById(id) {
        const userData = await this.readUserData();
        for(let index = 0; index < userData.length; index++) {
            if(userData[index].id == id) {
                return userData[index];
            }
        }
        return false;
    }

    async getUserIndexById(id, userData) {
        for(let index = 0; index < userData.length; index++) {
            if(userData[index].id == id) {
                return index;
            }
        }
        return false;
    }

    async setContext(id, request, completion) {
        const userData = await this.readUserData();
        const userIndex = await this.getUserIndexById(id, userData);
    
        userData[userIndex].req = request;
        userData[userIndex].completion = completion;
        await this.writeUserData(userData);
    }

}

module.exports = {
    db: new DB()
}