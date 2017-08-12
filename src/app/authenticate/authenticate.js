export class AuthCtrl {
    constructor() {  
    }
    $onInit() {
        window.QRCode.toDataURL('sample text dfadf fd adfdf af d fadf adf a daf afd', (err, url) => {
            this.imgUrl = url;
        });
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;