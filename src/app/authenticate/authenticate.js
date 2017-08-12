export class AuthCtrl {
    constructor($timeout) {
        this.$timeout = $timeout;
        this.updateQRCode(); 
    }

    updateQRCode() {
        // refresh the code every 8 secs
        if(!this.authed)            
            this.$timeout(() => {return this.updateQRCode()}, 8000)
        // request new id from server and update code
        window.QRCode.toDataURL(this.makeid(), (err, url) => {
            this.imgUrl = url;
        });
    }

    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 100; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;