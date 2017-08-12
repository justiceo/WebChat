export class AuthCtrl {
    constructor() {
        this.imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png';
        
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;