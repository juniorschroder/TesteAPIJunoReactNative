(function(window) {
    var Juno = window.Juno || {};
    window.Juno = Juno;

    function Card() {
        var self = this;
        this.mask = {
            DEFAULT_CC: '0000  0000  0000  0000',
            DEFAULT_CVC: '000',
        }
        this.type = {
            VISA: {
                name: 'visa',
                detector: /^4/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 99
            },
            MASTERCARD: {
                name: 'mastercard',
                detector: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 99
            },
            AMEX: {
                name: 'amex',
                detector: /^3[47]/,
                cardLength: 15,
                cvcLength: 4,
                maskCC: '0000  000000  00000',
                maskCVC: '0000',
                order: 99
            },
            DISCOVER: {
                name: 'discover',
                detector: /^6(?:011\d{12}|5\d{14}|4[4-9]\d{13}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))\d{10})/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 2
            },
            HIPERCARD: {
                name: 'hipercard',
                detector: /^606282|384100|384140|384160/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 4
            },
            DINERS: {
                name: 'diners',
                detector: /^(300|301|302|303|304|305|36|38)/,
                cardLength: 14,
                cvcLength: 3,
                maskCC: '0000  000000  0000',
                maskCVC: self.mask.DEFAULT_CVC,
                order: 5
            },
            JCB_15: {
                name: 'jcb_15',
                detector: /^2131|1800/,
                cardLength: 15,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 6
            },
            JCB_16: {
                name: 'jcb_16',
                detector: /^35(?:2[89]|[3-8]\d)/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 7
            },
            ELO: {
                name: 'elo',
                detector: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67([0-6][0-9]|7[0-8])|9\d{3})|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|(1|2|3)[0-9]|8[5-9]|9[0-9])|5((3|9)[0-8]|4[1-9]|([0-2]|[5-8])\d)|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|6516(5[2-9]|[6-7]\d)|6550(2[1-9]|5[0-8]|(0|1|3|4)\d))\d*/,
                cardLength: 16,
                cvcLength: 3,
                maskCC: self.mask.DEFAULT_CC,
                maskCVC: self.mask.DEFAULT_CVC,
                order: 1
            },
            AURA: {
                name: 'aura',
                detector: /^((?!5066|5067|50900|504175|506699)50)/,
                cardLength: 19,
                cvcLength: 3,
                maskCC: '0000000000000000000',
                maskCVC: self.mask.DEFAULT_CVC,
                order: 3
            }
        };
    }
    Card.prototype = {
        getType: function(value) {
            var cardNo = value.replace(/ /g, '');
            for (var key in this.getOrderedTypes()) {
                if (this.validator.number(cardNo, this.type[key])) {
                    return this.type[key];
                }
            }
            return false;
        },
        getOrderedTypes: function() {
            var types = {};
            var order = 1;
            while (order < 100) {
                for (var key in this.type) {
                    if (this.type[key].order == order) {
                        types[key] = this.type[key];
                    }
                }
                order++;
            }
            return types;
        },
        validateNumber: function(value) {
            var cardNo = value.replace(/ /g, '');
            var type = this.getType(cardNo);
            return type && type.cardLength == cardNo.length && this.validator.luhn(cardNo);
        },
        validateCvc: function(cardNo, cvcNo) {
            cardNo = cardNo.replace(/ /g, '');
            var type = this.getType(cardNo);
            return type && this.validator.cvc(cvcNo, type);
        },
        validateExpireDate: function(expirationMonth, expirationYear) {
            var today = new Date();
            var month = today.getMonth() + 1;
            var year = today.getFullYear();
            expirationMonth = parseInt(expirationMonth);
            expirationYear = parseInt(expirationYear);
            if (expirationMonth > 0 && expirationYear > 0 && expirationYear >= year) {
                if (expirationYear == year) {
                    return (expirationMonth > month);
                }
                return true;
            }
            return false;
        },
        validator: {
            number: function(cardNo, type) {
                return type.detector.test(cardNo);
            },
            luhn: function(cardNo) {
                var numberProduct, checkSumTotal = 0;
                for (var digitCounter = cardNo.length - 1; digitCounter >= 0; digitCounter = digitCounter - 2) {
                    checkSumTotal += parseInt(cardNo.charAt(digitCounter), 10);
                    numberProduct = String((cardNo.charAt(digitCounter - 1) * 2));
                    for (var productDigitCounter = 0; productDigitCounter < numberProduct.length; productDigitCounter++) {
                        checkSumTotal += parseInt(numberProduct.charAt(productDigitCounter), 10);
                    }
                }
                return (checkSumTotal % 10 == 0);
            },
            cvc: function(cvcNo, type) {
                return type.cvcLength == ('' + cvcNo).length;
            }
        }
    };
    Juno.Card = Card;
})(window);

(function(window) {
    var Juno = window.Juno || {};
    window.Juno = Juno;
    if ("undefined" === typeof TextEncoder) {
        TextEncoder = function() {};
        TextEncoder.prototype.encode = function(e) {
            for (var f = e.length, b = -1, a = "undefined" === typeof Uint8Array ? Array(1.5 * f) : new Uint8Array(3 * f), c, g, d = 0; d !== f;) {
                c = e.charCodeAt(d);
                d += 1;
                if (55296 <= c && 56319 >= c) {
                    if (d === f) {
                        a[b += 1] = 239;
                        a[b += 1] = 191;
                        a[b += 1] = 189;
                        break;
                    }
                    g = e.charCodeAt(d);
                    if (56320 <= g && 57343 >= g) {
                        if (c = 1024 * (c - 55296) + g - 56320 + 65536, d += 1, 65535 < c) {
                            a[b += 1] = 240 | c >>> 18;
                            a[b += 1] = 128 | c >>> 12 & 63;
                            a[b += 1] = 128 | c >>> 6 & 63;
                            a[b += 1] = 128 | c & 63;
                            continue;
                        }
                    } else {
                        a[b += 1] = 239;
                        a[b += 1] = 191;
                        a[b += 1] = 189;
                        continue;
                    }
                }
                127 >= c ? a[b += 1] = 0 | c : (2047 >= c ? a[b += 1] = 192 | c >>> 6 : (a[b += 1] = 224 | c >>> 12, a[b += 1] = 128 | c >>> 6 & 63), a[b += 1] = 128 | c & 63);
            }
            if ("undefined" !== typeof Uint8Array) {
                return a.subarray(0, b + 1);
            }
            a.length = b + 1;
            return a;
        };
        TextEncoder.prototype.toString = function() {
            return "[object TextEncoder]";
        };
        try {
            Object.defineProperty(TextEncoder.prototype, "encoding", {
                get: function() {
                    if (TextEncoder.prototype.isPrototypeOf(this)) {
                        return "utf-8";
                    }
                    throw TypeError("Illegal invocation");
                }
            });
        } catch (e) {
            TextEncoder.prototype.encoding = "utf-8";
        }
        "undefined" !== typeof Symbol && (TextEncoder.prototype[Symbol.toStringTag] = "TextEncoder");
    }

    function Crypto() {
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        this.lookup = new Uint8Array(256);
        this.initB64();
    }
    Crypto.prototype = {
        encrypt: function(pemPublicKey, stringData) {
            return this.importPublicKey(pemPublicKey).then(function(publicKey) {
                return new Promise(function(resolve, reject) {
                    var data = this.stringToArrayBuffer(stringData);
                    window.crypto.subtle.encrypt({
                        name: "RSA-OAEP",
                        hash: {
                            name: "SHA-256"
                        }
                    }, publicKey, data).then(function(encrypted) {
                        var encoded = this.encodeAb(encrypted);
                        resolve(encoded);
                    }.bind(this)).catch(function(err) {
                        reject(err);
                    });
                }.bind(this));
            }.bind(this));
        },
        importPublicKey: function(pemPublicKey) {
            return new Promise(function(resolve, reject) {
                window.crypto.subtle.importKey("spki", this.pemToArrayBuffer(pemPublicKey), {
                    name: "RSA-OAEP",
                    hash: {
                        name: "SHA-256"
                    }
                }, false, ["encrypt"]).then(function(importedKey) {
                    resolve(importedKey);
                }).catch(function(err) {
                    reject(err);
                });
            }.bind(this));
        },
        initB64: function() {
            for (var i = 0; i < this.chars.length; i++) {
                this.lookup[this.chars.charCodeAt(i)] = i;
            }
        },
        removeLines: function(str) {
            return str.replace("\n", "");
        },
        base64ToArrayBuffer: function(b64) {
            var byteString = window.atob(b64);
            var byteArray = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                byteArray[i] = byteString.charCodeAt(i);
            }
            return byteArray;
        },
        pemToArrayBuffer: function(pem) {
            var b64Lines = this.removeLines(pem);
            var b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
            var b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');
            return this.base64ToArrayBuffer(b64Final);
        },
        stringToArrayBuffer: function(str) {
            var encoder = new TextEncoder('utf-8');
            var byteArray = encoder.encode(str);
            return byteArray.buffer;
        },
        encodeAb: function(arrayBuffer) {
            var bytes = new Uint8Array(arrayBuffer),
                i, len = bytes.length,
                base64 = '';
            for (i = 0; i < len; i += 3) {
                base64 += this.chars[bytes[i] >> 2];
                base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += this.chars[bytes[i + 2] & 63];
            }
            if ((len % 3) === 2) {
                base64 = base64.substring(0, base64.length - 1) + '=';
            } else if (len % 3 === 1) {
                base64 = base64.substring(0, base64.length - 2) + '==';
            }
            return base64;
        }
    };
    Juno.Crypto = Crypto;
})(window);

(function(window) {
    var Juno = window.Juno || {};
    window.Juno = Juno;

    function DirectCheckout(publicToken, prod = true) {
        this._version = "0.0.2";
        this._url = 'https://' + (prod ? 'www' : 'sandbox') + '.boletobancario.com/boletofacil/integration/api/';
        this._publicKey = null;
        this._countAwaitingPublicKey = 0;
        this._publicToken = publicToken;
        this._crypto = new Juno.Crypto();
        this._card = new Juno.Card();
        this._loadPublicKey();
    }
    DirectCheckout.prototype = {
        getCardType: function(cardNumber) {
            return (this.isValidCardNumber(cardNumber)) ? this._card.getType(cardNumber).name : false;
        },
        isValidCardNumber: function(cardNumber) {
            return this._card.validateNumber(cardNumber);
        },
        isValidSecurityCode: function(cardNumber, securityCode) {
            return this._card.validateCvc(cardNumber, securityCode);
        },
        isValidExpireDate: function(expirationMonth, expirationYear) {
            return this._card.validateExpireDate(expirationMonth, expirationYear);
        },
        isValidCardData: function(cardData, error) {
            if (!this._publicKey) {
                error(Error('Invalid public key'));
                return false;
            }
            if (!cardData) {
                error(Error('Invalid card data'));
                return false;
            }
            if (!cardData.holderName || cardData.holderName == "") {
                error(Error('Invalid holder name'));
                return false;
            }
            if (!this.isValidCardNumber(cardData.cardNumber)) {
                error(Error('Invalid card number'));
                return false;
            }
            if (!this.isValidSecurityCode(cardData.cardNumber, cardData.securityCode)) {
                error(Error('Invalid security code'));
                return false;
            }
            if (!this.isValidExpireDate(cardData.expirationMonth, cardData.expirationYear)) {
                error(Error('Invalid expire date'));
                return false;
            }
            return true;
        },
        getCardHash: function(cardData, success, error) {
            this._checkPublicKey(function() {
                if (this.isValidCardData(cardData, error)) {
                    this._internalGetCardHash(cardData).then(function(cardHash) {
                        success(cardHash);
                    }, function(e) {
                        error(e);
                    });
                }
            }.bind(this));
        },
        _internalGetCardHash: function(cardData) {
            return new Promise(function(resolve, reject) {
                cardData = JSON.stringify(cardData);
                this._crypto.encrypt(this._publicKey, cardData).then(function(encoded) {
                    var url = this._url + 'get-credit-card-hash.json';
                    var params = 'publicToken=' + this._publicToken;
                    params += '&encryptedData=' + window.encodeURIComponent(encoded);
                    this._ajax('POST', url, params).then(function(response) {
                        response = JSON.parse(response)
                        if (response.success) {
                            resolve(response.data);
                        } else {
                            reject(Error(response.errorMessage));
                        }
                    }.bind(this), function(error) {
                        reject(Error('Error on retrieve public key: ' + error));
                    });
                }.bind(this), function(error) {
                    reject(Error('Error on encrypt data: ' + error));
                });
            }.bind(this));
        },
        _loadPublicKey: function() {
            var url = this._url + 'get-public-encryption-key.json';
            var params = 'publicToken=' + this._publicToken + '&version=' + this._version;;
            this._ajax('POST', url, params).then(function(response) {
                response = JSON.parse(response);
                if (response.success) {
                    this._publicKey = response.data;
                } else {
                    throw Error(response.errorMessage);
                }
            }.bind(this), function(error) {
                throw Error("Error on retrieve public key", error);
            });
        },
        _ajax: function(type, url, params) {
            return new Promise(function(resolve, reject) {
                var req = new XMLHttpRequest();
                req.open(type, url);
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.onload = function() {
                    if (req.status == 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };
                req.onerror = function() {
                    reject(Error('Network Error'));
                };
                req.send(params);
            });
        },
        _checkPublicKey: function(callback) {
            if (!this._publicKey && this._countAwaitingPublicKey < 100) {
                setTimeout(function() {
                    this._countAwaitingPublicKey++;
                    this._checkPublicKey(callback);
                }.bind(this), 100);
            } else {
                callback();
            }
        }
    };
    window.DirectCheckout = DirectCheckout;
})(window);