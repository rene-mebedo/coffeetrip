import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// import fixtures at first
import './fixtures/accounts';

import './app/mebedo-world';

import './app/konfiguration';
import './app/konfiguration/apps/mandanten';
import './app/konfiguration/apps/preislisten';
import './app/konfiguration/apps/artikel';
import './app/konfiguration/apps/laender';
import './app/konfiguration/apps/laendergruppen';

import './app/fibu';
import './app/fibu/apps/kontierungen';
import './app/fibu/apps/kontiergruppen';
import './app/fibu/apps/fibustati';

import './app/akademie/';
import './app/akademie/apps/seminarmodule';
import './app/akademie/apps/seminare';
import './app/akademie/apps/seminarteilnehmer';
import './app/akademie/apps/dozenten';

import './app/consulting/';
import './app/consulting/apps/projekte';
import './app/consulting/apps/teilprojekte';
import './app/consulting/apps/aktivitaeten';

import './app/allgemein';
import './app/allgemein/apps/adressen';
import './app/allgemein/apps/kontakte';

import './app/intern';
import './app/intern/apps/urlaubskonto';
import './app/intern/apps/urlaubsanspruch';

// ganz am Ende importieren wir die Reports
import './app/allgemein/reports';
import './app/akademie/reports';
import './app/consulting/reports/projekte-by-user.card';


Meteor.publish('currentUser', function publishCurrentUser(this:Subscription): Mongo.Cursor<Meteor.User, Meteor.User> | null {
    if (!this.userId) {
        this.ready();
        return null;  
    }

    // extra publish with the field of userdata: { ... }
    // by default meteor only publishs id and username
    return Meteor.users.find({ _id: this.userId });
});
