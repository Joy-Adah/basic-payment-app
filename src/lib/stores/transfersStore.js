import { persisted } from 'svelte-local-storage-store'

/**
 * @typedef {Object} TransferEntry
 * @property {string} id Unique identifier for this transfer
 * @property {string} asset_code Asset code involved in the transfer
 */

/**
 * @typedef {Object.<string, TransferEntry[]>} DomainEntry
 * @property {('sep6'|'sep24')} protocol Protocol the transfer was initiated with (i.e., SEP-6 or SEP-24)
 */

/**
 * @typedef {Object.<string, DomainEntry>} TransfersStore
 * @property {string} homeDomain Home domain of an asset issuer on the Stellar network the user has initiated a transfer with previously
 */

function createTransfersStore() {
    /** @type {import('svelte/store').Writable<TransfersStore>} */
    const { subscribe, set, update } = persisted('bpa:transfersStore', {})

    return {
        subscribe,

        /**
         * Adds a new transfer ID to the list of tracked anchor transfers.
         * @param {Object} opts Options object
         * @param {string} opts.homeDomain Home domain of the anchor server facilitating the transfer
         * @param {('sep6'|'sep24')} opts.protocol Which standard was used for this transfer (SEP-6 or SEP-24)
         * @param {string} opts.assetCode Asset code involved in the transfer
         * @param {string} opts.transferID Unique identifier for this transfer
         */
        addTransfer: ({ homeDomain, protocol, assetCode, transferID }) =>
            update((store) => {
                let newStore = { ...store }
                if (homeDomain in newStore) {
                    if (protocol in newStore[homeDomain]) {
                        newStore[homeDomain][protocol].push({
                            id: transferID,
                            asset_code: assetCode,
                        })
                    } else {
                        newStore[homeDomain][protocol] = [{ id: transferID, asset_code: assetCode }]
                    }
                } else {
                    newStore[homeDomain] = {
                        [protocol]: [{ id: transferID, asset_code: assetCode }],
                    }
                }
                return newStore
            }),
    }
}

export const transfers = createTransfersStore()
