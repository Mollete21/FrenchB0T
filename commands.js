/*
 *  commands.js
 *  Toutes (ou presque) les commandes du bot
 *  doivent se trouver ici.
 *  Doc:
 *  Pour une commande de type:
 *  /cmd params
 *  La variable params contient les paramètres
 *  de la commande, qui sont à parser comme on veut
 *  from: celui qui exécute la commande
 *  room: room où la commande a été lancée
 */
var fs = require('fs');
var parseString = require('xml2js').parseString;

exports.Cmd = {
    /***********************************
     *       ☆ CRÉDITS ☆
     ***********************************/

    about: function(c, params, from, room) {
        var txt = 'Juif est un bot créé par Keb avec la technologie javascript côté serveur node.js. Ce bot est open source: https://github.com/Kebabier/Juif';
        if (this.isRanked(from, '+')) {
            this.talk(c, room, txt);
        } else {
            this.talk(c, room, '/pm ' + from + ', ' + txt);
        }
    },

    /***********************************
     *       ☆ MODÉRATION ☆
     ***********************************/
    autoban: 'ab',
    ab: function(c, params, from, room) {
        if (!this.isRanked(from, '@') || !params) return false;
        var opts = params.split(',');
        if (!opts[1]) opts[1] = 'Pas de motif.';
        var data = makeId(opts[0]) + '|' + room + '|' + opts[1];
        fs.appendFile('data/banlist.txt', '\n' + data, function(err) {
            console.log(err);
        });
        //On vire les sauts de lignes inutiles
        var e = fs.readFileSync('data/banlist.txt').toString();
        var output = e.replace(/^\s*$[\n\r]{1,}/gm, '');
        fs.writeFileSync('data/banlist.txt', output);
        this.talk(c, room, '/rb ' + opts[0] + ', Ban permanent pour ' + opts[0] + ': ' + opts[1]);
        this.talk(c, room, '/modnote Ban permanent pour ' + opts[0] + ': ' + opts[1]);
    },

    unautoban: 'aub',
    uab: 'aub',
    aub: function(c, params, from, room) {
        if (!this.isRanked(from, '#') || !params) return false;

        var success = false;
        var banlist = fs.readFileSync('data/banlist.txt').toString().split('\n');
        var temp = fs.readFileSync('data/banlist.txt').toString();

        for (var i = 0; i < banlist.length; i++) {
            var spl = banlist[i].toString().split('|');
            if (makeId(params) == spl[0]) {
                var search = spl[0] + '|' + spl[1] + '|' + spl[2];
                var idx = temp.indexOf(search);
                if (idx >= 0) {
                    var output = temp.substr(0, idx) + temp.substr(idx + search.length);
                    //On tej la ligne vide inutile qui fait planter le script
                    output = output.replace(/^\s*$[\n\r]{1,}/gm, '');
                    fs.writeFileSync('data/banlist.txt', output);
                    this.talk(c, room, '/roomunban ' + spl[0]);
                    this.talk(c, room, spl[0] + ' a bien été débanni.');
                    success = true;
                }
            }
        }
        if (success == false) this.talk(c, room, params + ' n\'est pas banni.');
    },

    bword: 'banword',
    banword: function(c, params, from, room) {
        if (!this.isRanked(from, '@') || !params) return false;
        fs.appendFile('data/bannedwords.txt', params + '|' + room + '\n', function(err) {
            console.log(err);
        });
        this.talk(c, room, 'Le mot "' + params + '" a bien été banni de la room ' + room + '.');
    },

    ubword: 'unbanword',
    unbanword: function(c, params, from, room) {
        if (!this.isRanked(from, '#') || !params) return false;

        var success = false;
        var bannedwords = fs.readFileSync('data/bannedwords.txt').toString().split('\n');
        var temp = fs.readFileSync('data/bannedwords.txt').toString();

        for (var i = 0; i < bannedwords.length; i++) {
            var spl = bannedwords[i].toString().split('|');
            if (makeId(params) == spl[0] && spl[1] == room) {
                var search = spl[0] + '|' + spl[1];
                var idx = temp.indexOf(search);
                if (idx >= 0) {
                    var output = temp.substr(0, idx) + temp.substr(idx + search.length);
                    output = output.replace(/^\s*$[\n\r]{1,}/gm, '');
                    fs.writeFileSync('data/bannedwords.txt', output);
                    this.talk(c, room, 'Le mot "' + spl[0] + '" a bien été débanni de la room' + spl[1] + '.');
                    success = true;
                }
            }
        }
        if (success == false) this.talk(c, room, 'Le mot "' + params + '" n\'est pas banni.');
    },

    blacklist: 'bl',
    johncena: 'bl',
    jeffhardy: 'bl',
    bl: function(c, params, from, room) {
        if (!this.isRanked(from, '@')) return false;
        var banlist = fs.readFileSync('data/banlist.txt').toString().split('\n');
        var str = '';
        for (var i = 0; i < banlist.length; i++) {
            var spl = banlist[i].toString().split('|');
            str += spl[0] + ' (' + spl[1] + ') Motif: ' + spl[2] + '\n';
        }
        this.upToHastebin(c, from, room, str);
    },

    tempban: 'tb',
    tb: function(c, params, from, room) {
        if (!this.isRanked(from, '#')) return false;
        var opts = params.split(',');
        if (!opts[1]) return false;
        var to = opts[0];
        var time = opts[1] * 60 * 1000;
        var self = this;
        this.talk(c, room, '/rb ' + to + ', Ban temporaire de ' + time + ' minutes.');
        setTimeout(function() {
            self.talk(c, room, '/roomunban ' + to);
        }, time);
    },

    /*******************************************
     *       ☆ FONCTIONNALITÉS DIVERSES ☆
     *******************************************/
    juif: function(c, params, from, room) {
        if (!this.isRanked(from, '+')) {
            this.talk(c, room, 'Liste des commandes de juif: https://github.com/Kebabier/Juif#documentation');
        } else {
            this.talk(c, room, '/pm ' + from + ', Liste des commandes de juif: https://github.com/Kebabier/Juif#documentation');
        }
    },
    ca: 'fc',
    fc: function(c, params, from, room) {
        var opts = params.split(',');
        var success = false;

        if (!opts[1]) {
            var fc = fs.readFileSync('data/fc.txt').toString().split('\n');
            for (var i = 0; i < fc.length; i++) {
                var spl = fc[i].toString().split('|');
                if (makeId(params) == spl[0]) {
                    this.talk(c, room, 'Le code ami de ' + params + ' est: ' + spl[1]);
                    success = true;
                }
            }
            if (!success) {
                this.talk(c, room, 'Le code ami de ' + params + ' n\'est pas encore enregistré.');
            }
        }

        if (opts[0] == 'add') {
            if (opts[1].length != 15) {
                this.talk(c, room, 'Un code ami doit être composé que de 12 chiffres.');
                return false;
            }
            var a = fs.readFileSync('data/fc.txt').toString().split('\n');
            for (var i = 0; i < a.length; i++) {
                var spl = a[i].toString().split('|');
                if (spl[0] == makeId(from)) {
                    this.talk(c, room, 'Vous avez déjà enregistré un code ami sous ce nom (utilisez le paramètre "edit" pour modifier votre code ami) .')
                    return false;
                }
            }
            fs.appendFile('data/fc.txt', makeId(from) + '|' + opts[1] + '\n', function(err) {
                console.log(err);
            });
            this.talk(c, room, 'Le code ami de ' + from + ' a bien été enregistré.');
        }
        if (opts[0] == 'edit') {
            var e = fs.readFileSync('data/fc.txt').toString().split('\n');
            var f = fs.readFileSync('data/fc.txt').toString();
            var str = makeId(from) + '|' + opts[1];
            if (opts[1].length != 15) {
                this.talk(c, room, 'Un code ami doit être composé que de 12 chiffres.');
                return false;
            }
            for (var i = 0; i < e.length; i++) {
                var spl = e[i].toString().split('|');
                if (spl[0] == makeId(from)) {
                    var search = makeId(from) + '|' + spl[1];
                    var idx = f.indexOf(search);
                    if (idx >= 0) {
                        var output = f.substr(0, idx) + f.substr(idx + search.length);
                        output = output.replace(/^\s*$[\n\r]{1,}/gm, '');
                        fs.writeFileSync('data/fc.txt', output + '\n' + str);
                        this.talk(c, room, 'Le code ami de ' + from + ' a bien été remplacé par ' + opts[1]);
                    }
                }
            }
        }
    },

    roomkick: 'rk',
    rk: function(c, params, from, room) {
        if (!this.isRanked(from, '#')) return false;
        this.talk(c, room, '/rb ' + params + ', La team rocket s\'en va vers d\'autres cieeeeeeeux !');
        this.talk(c, room, '/roomunban ' + params);
    },

    vdm: function(c, params, from, room) {
        if (!this.isRanked(from, '+')) return false;
        //y a ma clé API VDM, vous avez vu comment je suis gentil ?
        var self = this;
        var reqOpts = {
            hostname: "api.fmylife.com",
            method: "GET",
            path: '/view/random/sexe?language=fr&key=5395d4752b0a9'
        };
        var data = '';
        var req = require('http').request(reqOpts, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function(chunk) {
                parseString(data, function(err, result) {
                    if (err) throw err;
                    self.talk(c, room, result.root.items[0].item[0].text);
                });
            });
        });
        req.end();
    },

    repeter: 'repeat',
    repeat: function(c, params, from, room) {
        if (!this.isRanked(from, '@')) return false;
        var spl = params.split('::');
        if (!spl[0] || !spl[1] || !spl[2]) return false;
        var time = spl[2].replace(/\s/g, '')*60*1000;
        var id = spl[0].replace(/\s/g, '');
        var self = this;
        this.repeat(c, spl[1], time, room, 'timer' + id);
        console.log(this);
        this.talk(c, room, 'Repeat lancé avec l\'id "' + id + '". Intervalle: ' + spl[2] + ' minutes.');
    },

    stoprepeat: function(c, params, from, room) {
        if (!this.isRanked(from, '@')) return false;
        if (!params) return false;
        var id = 'timer' + params;
        clearInterval(this[id]);
        this.talk(c, room, 'Le repeat "' + params + '" a bien été arrêté.');
    },

    translate: 'trad',
    traduction: 'trad',
    tr: 'trad',
    trad: function(c, params, from, room) {
        var item = makeId(params);
        if (!this.isRanked(from, '+')) room = '#' + from;

        var lang = ['fr', 'us'];

        var reqOpts = {
            hostname : 'pokemontrash.com',
            method: 'GET',
            path: '/api/' + lang[0] + '/to/' + lang[1] + '/' + item
        };


        function findItem(reqOpts){
            var data = '';

            var req = require('http').request(reqOpts, function(res) {
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function(chunk) {
                    var d = JSON.parse(data);
                    //console.log(d);
                    if (d.exists == true) return Parser.talk(c, room, 'Traduction: **' + d.to + '**');
                });
            });
            req.end();
        }

        if (!findItem(reqOpts)) {
            reqOpts.path = '/api/' + lang[1] + '/to/' + lang[0] + '/' + item;
            findItem(reqOpts);
        } else {
            findItem(reqOpts);
        }

    },

    '8ball': function(c, params, from, room) {
        var phrases = fs.readFileSync('data/8ball.txt').toString().split("\n");
        var random = Math.floor((Math.random() * phrases.length) + 1);

        if (this.isRanked(from, '+')) {
            this.talk(c, room, '(' + from.substr(1) + ') ' + phrases[random]);
        } else {
            this.talk(c, room, '/pm ' + from + ', ' + phrases[random]);
        }
    },
    fagtest: 'lagtest',
    lagtest: function(c, params, from, room) {
        if (!this.isRanked(from, '%')) return false;
        this.timestamp1 = Date.now();
        this.talk(c, room, 'PATA...');
        this.talk(c, room, 'PON!');
    },

    talk: function(c, params, from, room) {
        if (!this.isRanked(from, '@')) return false;
        var txt = 'Réponses automatiques ';
        if (params === 'on') {
            Conf.autoR = true;
            txt += 'activées.';
        } else if (params === 'off') {
            Conf.autoR = false;
            txt += 'désactivées.'
        } else {
            //Précaution
            txt = 'Vous devez utiliser le paramètre "on" ou "off".'
        }
        this.talk(c, room, txt);
    },
