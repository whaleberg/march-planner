import {nanoid} from 'nanoid'

export function newId():string {
    return `${Date.now()}-${nanoid(6)}`;
}