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

/**
 * Check if the value is an item of the array
 * 
 * @param {*} v Value to compare with Array-items
 * @param {*} a Array to compare
 * @returns true or false if value exists in item
 */
 export const isOneOf = (v:any, a:Array<any>):boolean => {
	let i:number, max:number = a.length;

	for (i=0; i < max; i++) {
		if (a[i] === v) return true;
	}

	return false;
}