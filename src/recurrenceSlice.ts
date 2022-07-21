import {Frequency, RRule, Weekday} from "rrule";


export interface InitialRruleState {
    freq?: Frequency,
    dtstart?: any,
    until?: any,
    tzid: string | null,
    count?: number | null,
    interval?: number,
    wkst?: any,
    byweekday?: any,
    bymonth?: number[],
    bysetpos?: number[],
    bymonthday?: number[],
    byyearday?: number[],
    byweekno?: number[],
    byhour?: number[],
    byminute?: number[]
}

const weekdaysMap = (weekdaysArr: string[])=>{
    const bWDA = weekdaysArr
    return bWDA && bWDA.map( (item: string) => {
        return wkstTransform(item)
    })
}

const wkstTransform = ( wkst: string | number)=>{
    let newItem: Weekday
    switch (wkst){
        case 'Mon':
        case 0:
        default:
            newItem = RRule.MO
            break
        case 'Tue':
        case 1:
            newItem = RRule.TU
            break
        case 'Wed' || 2:
        case 2:
            newItem = RRule.WE
            break
        case 'Thu' || 3:
        case 3:
            newItem = RRule.TH
            break
        case 'Fri' || 4:
        case 4:
            newItem = RRule.FR
            break
        case 'Sat' || 5:
        case 5:
            newItem = RRule.SA
            break
        case 'Sun' || 6:
        case 6:
            newItem = RRule.SU
            break
    }
    return newItem
}

export const initialRrule: InitialRruleState = {
    freq: 3,
    tzid: `${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
}

 export const initialRruleString = {
    freq: 3,
    tzid: `${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
}

 export const createRrule = (action: InitialRruleState) => {
    const bwd = action.byweekday ? weekdaysMap(action.byweekday) : []
    const bwkst = action.wkst ? wkstTransform(action.wkst) : null

    const rruleObj = new RRule({
        until: action.until && new Date(action.until),
        tzid: action.tzid,
        freq: action.freq,
        count: action.count,
        wkst: bwkst,
        bymonth: action.bymonth,
        bymonthday: action.bymonthday,
        byyearday: action.byyearday,
        byweekno: action.byweekno,
        byweekday: bwd,
        byhour: action.byhour,
        byminute: action.byminute,
        bysetpos: action.bysetpos,
        interval: action.interval
    })
    return rruleObj.toString()
}

 export const excludeRule = (action: {rule?:string, cur: string})=> {
    const cleanCur = action.cur || ''
    const exRule = action.rule ? ('\nEXRULE:' + action.rule) : ''

    return cleanCur + exRule
}

 export const rDate = (action: {rDate:string, cur:string}) =>{
    let cur = action.cur
    if (cur.length === 0){
        const obj =  new RRule({...initialRrule})
        cur = obj.toString()
    }
    return  cur + action.rDate
}

 export const cleanRule = () =>{
    const rruleObj = new RRule({...initialRrule})
    return rruleObj.toString()
}

