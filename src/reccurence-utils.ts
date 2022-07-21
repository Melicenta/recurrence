export const getRecurrenceAndRDate = (recurrence: string) => {

        if (recurrence.includes('RDATE:')){
            const subStr = recurrence.split('RDATE:')[0]
            const rd = recurrence.split('RDATE:')[1]

            return {rec: subStr, rDate: rd}
        } else {
            return {rec: recurrence, rDate: undefined}
        }
}

export const convertDateToTime = (timeLikeStr: string)=>{

    const _hStart = Number(timeLikeStr.split(':')[0])
    const _mStart = Number(timeLikeStr.split(':')[1])
    const _tStart = new Date()

    _tStart.setHours(_hStart)
    _tStart.setMinutes(_mStart)

    return _tStart
}

/**
 * @method convertCustomDateToDate
 * @param customDate : `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
 * **/
export const convertCustomDateToDate = (customDate: string)=>{

    const _yStart = Number(customDate.split('-')[0])
    const _mStart = Number(customDate.split('-')[1]) - 1
    const _dStart = Number(customDate.split('-')[2])
    const _dtStart = new Date()

    _dtStart.setFullYear(_yStart,_mStart,_dStart)

    return _dtStart
}

export const convertDateToCustomTimeString = (date: Date) =>{
    const _hh = returnAlwaysTwoDigitsAsString(date.getHours())
    const _mm = returnAlwaysTwoDigitsAsString(date.getMinutes())
    const _ss = returnAlwaysTwoDigitsAsString(date.getSeconds())

    return `${_hh}:${_mm}:${_ss}`
}

export const returnAlwaysTwoDigitsAsString = (digits: number) =>{
    if (digits < 10){
        return `0${digits}`
    } else return `${digits}`
}

/**
 * if RDATE comes in 20220628T163100Z format from server,
 * convert to real date string as 2022-06-28T00:00:00.000Z
* */
export const convertFromStringToDateString =(str: string) => {
    if (str.length > 0){
        if (str.includes('-')){
            return str
        } else {
            let dateStr = str.split('T')[0]
            const year = dateStr.slice(0,4)
            const month = dateStr.slice(5,6)
            const date = dateStr.slice(6,8)

            dateStr =[year,
                returnAlwaysTwoDigitsAsString(Number(month)),
                returnAlwaysTwoDigitsAsString(Number(date))].join('-')

            return dateStr
        }
    } else return undefined
}

export const convertISOStringToString = (isoStr: string) => {
   return  isoStr
       .replaceAll('-','')
       .replaceAll(':','')
       .replaceAll('.','')
}