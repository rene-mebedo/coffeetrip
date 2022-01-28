import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { World } from '../../imports/api/lib/world'
import { RolesEnum } from './security';
import { IWorldUser } from '/imports/api/types/world';

export const MebedoWorld = new World({
    title: 'MEBEDO AC World',
    description: 'MEBEO AC Portal für alle Mitarbeiter, Kunden, Partner sowie alle Interessierten.',
    imageUrl: '/MEBEDO_LOGO_PRINT_RGB-300x88.jpg',

    login: {
        welcome:'Herzlich Willkommen!',
        introduction: 'Sie befinden sich auf der Zugangseite unseres Portals. Hier haben Sie Zugriff als Kunden, Partner, Mitarbeiter und Seminarteilnehmer auf alle Ressourcen.',
        imageUrl: '/MEBEDO_LOGO_PRINT_RGB-300x88.jpg',
        with: {
            password: true,
            google: true,
            facebook: true
        },
        register: true,
        forgotPassword: true
    },

    register: {
        initialRoles: [ RolesEnum.EVERYBODY ]
    }
});


declare const ServiceConfiguration: any;

const settings = Meteor.settings;

if (settings) {
    const { web } = settings.auth.google;
    
    ServiceConfiguration.configurations.upsert({ service: 'google' }, {
        $set: {
            loginStyle: "popup",
            clientId: web.client_id,
            secret: web.client_secret
        }
    });
}

Accounts.config({
    sendVerificationEmail: true, 
    forbidClientAccountCreation: true,
    
    /*restrictCreationByEmailDomain?: string | Function | undefined;
    loginExpirationInDays?: number | undefined;
    oauthSecretKey?: string | undefined;
    passwordResetTokenExpirationInDays?: number | undefined;
    passwordEnrollTokenExpirationInDays?: number | undefined;
    ambiguousErrorMessages?: boolean | undefined;
    defaultFieldSelector?: { [key: string]: 0 | 1 } | undefined;*/
    
})

Accounts.emailTemplates.siteName = 'MEBEDO GutachtenPlus';
Accounts.emailTemplates.from = 'MEBEDO Consulting GmbH <gutachtenplus@mebedo-ac.de>';

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  return `Welcome to Awesome Town, ${user.userData.firstName}`;
};

Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return 'You have been selected to participate in building a better future!'
    + ' To activate your account, simply click the link below:\n\n'
    + url;
};

Accounts.emailTemplates.resetPassword = {
    subject() {
       return "MEBEDO GutachtenPlus - Passwort vergessen";
    },
    html(user, url) {
         const { gender, firstName, lastName} = (user as IWorldUser).userData as any;
         const [ host, token ] = url.split('/#/reset-password/');
 
         return `Guten Tag ${gender} ${lastName},<br>
             <p>
                 Sie haben Ihr Passwort für <strong>MEBEDO GutachtenPlus</strong> vergessen - kein Problem!
             </p>
             <p>
                 Bitte betätigen Sie den nachfolgenden Link und vergeben Sie sich einfach ein neues Passwort.
                 <br>
                 <br>
                 <a href="https://gutachten.mebedo-ac.de/reset-password/${token}" target="_blank">Neues Passwort festlegen</a>
             </p>
             <p>
                 Nach erfolgreicher Änderung Ihres Passworts werden Sie umgehend angemeldet und können direkt weiterarbeiten.
             </p>
             <p>
                 Haben Sie weiterführende Fragen oder Anregungen, so wenden Sie sich bitte direkt an:
                 <br>
                 <br>MEBEDO Consulting GmbH
                 <br><strong>Herrn Rene Schulte ter Hardt</strong>
                 <br>Aubachstraße 22
                 <br>56410 Montabaur
                 <br>
                 <br>Telefon: <a href="tel:+49260295081298">+49(0)2602 9508-1298</a>
                 <br>E-Mail: schulteterhardt@mebedo-ac.de
             </p>
             <p>
                 Beste Grüße
                 <br>
                 <br>
                 <br><strong>Ihre MEBEDO Consulting GmbH</strong>
             </p>
         `;
    }
 };

Accounts.emailTemplates.verifyEmail = {
   subject() {
      return "MEBEDO AC World - Zugang aktivieren";
   },
   html(user, url) {
        const { gender, firstName, lastName} = (user as IWorldUser).userData as any;
        const [ host, token ] = url.split('/#/verify-email/');

        return `Guten Tag ${gender} ${lastName},<br>
            <p>
                Sie wurden soeben in unserem Portal als neuer Benutzer registriert.
            </p>
            <p>                
                Wir bitten Sie um Bestätigung dieses Benutzerzugangs indem Sie den nachfolgenden Link anwählen.
                <br>
                <a href="https://world.mebedo-ac.de/verify-email/${token}" target="_blank">Jetzt Zugang bestätigen</a>
            </p>
            <p>
                Nach erfolgreicher Bestätigung können Sie jederzeit die Anwendung über <a href="https://world.mebedo-ac.de">https://world.mebedo-ac.de</a> erreichen.
            </p>
            <p>
                Sollten Sie Fragen haben, so wenden Sie sich bitte direkt an:
                <br>
                <br>MEBEDO Consulting GmbH
                <br><strong>Herrn Rene Schulte ter Hardt</strong>
                <br>Aubachstraße 22
                <br>56410 Montabaur
                <br>
                <br>Telefon: <a href="tel:+49260295081298">+49(0)2602 9508-1298</a>
                <br>E-Mail: schulteterhardt@mebedo-ac.de
            </p>
            <p>
                Viele Grüße
                <br>
                <br>
                <br><strong>Ihr MEBEDO AC Team</strong>
            </p>
        `;
   }
};