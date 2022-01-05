interface  IExtras {
    title?: string | null,
    onUpdate?: string | null
}

export const FieldNamesAndMessages = (artikel: string, nameSingular: string, artikelPlural: string, namePlural:string, extras:IExtras = { title: null, onUpdate: null }) => {
    const { onUpdate, title } = extras;

    let nam = {
        title: title || nameSingular,

        namesAndMessages: {
            singular: { ohneArtikel: nameSingular, mitArtikel: artikel + ' ' + nameSingular},
            plural: { ohneArtikel: namePlural, mitArtikel: artikelPlural || artikel + ' ' + namePlural},

            messages: {
                onUpdate: onUpdate || (artikel + ' ' + nameSingular)
            }
        }
    }

    return nam;
}

