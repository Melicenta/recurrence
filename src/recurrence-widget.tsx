import React, {useState} from "react";
import {
    Alert,
    Button,
    Col,
    Form,
    FormGroup,
    InputGroup,
    Row,
    Table
} from "react-bootstrap";
import {Frequency, rrulestr} from "rrule";
// @ts-ignore
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {initialRrule,
    InitialRruleState,
    cleanRule,
    rDate,
    excludeRule,
    createRrule
} from "./recurrenceSlice";
import './recurrence-widget.scss'
import {
    convertCustomDateToDate, convertDateToCustomTimeString,
    convertFromStringToDateString,
    convertISOStringToString,
    getRecurrenceAndRDate
} from "./reccurence-utils";



interface Props {
    onSubmit: (str:string)=> void
    recurrenceState?: string
}

interface FormState {
    rule: InitialRruleState,
    default: boolean,
    until: boolean,
    RDATE?: string
}

export const RecurrenceWidget = ({recurrenceState, onSubmit}:Props) => {

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const FREQ = [
        {code:3, freq:'DAILY', active: false},
        {code:2, freq:'WEEKLY', active: false},
        {code:1, freq:'MONTHLY', active: false},
        {code:0, freq:'YEARLY', active: true}
        ]

    const DAYSMAP = DAYS.map( (day, i )=> {return {i, day, active:false}})
    const MONTHSMAP = MONTHS.map( (month, i )=> {return {i: i+1, month, active:false}})

    const DAYSByCode  = (arr?: number[])=> arr ? arr.map( item => DAYS[item]) : []
    const MONTHSByCode  = (arr?: number[])=> arr ? arr.map( item => MONTHS[item-1]) : []
    const MONTHSByName  = (arr?: string[])=> arr
        ? arr.map( item => {
            const code =  MONTHSMAP.find(it => item === it.month)?.i || 1
            return code
        })
        : []


    const getFrequency = (val: string) => {
        let freq: Frequency

        switch (val){
            case '0':
            default:
                freq = Frequency.YEARLY
                break;
            case '1':
                freq = Frequency.MONTHLY
                break;
            case '2':
                freq = Frequency.WEEKLY
                break;
            case '3':
                freq = Frequency.DAILY
                break;
        }

        return freq
    }

    let existingRule: InitialRruleState = initialRrule

    if (recurrenceState){
        const _clearedRrule = recurrenceState
        const onlyRRuleStr = _clearedRrule.split('RDATE:')[0]
        const recSt = onlyRRuleStr
            ? rrulestr(onlyRRuleStr).options
            : _clearedRrule && rrulestr(_clearedRrule).options

        if (recSt){
            existingRule = {
                freq: recSt.freq,
                dtstart: recSt.dtstart.toUTCString(),
                until: recSt.until,
                tzid: recSt.tzid,
                count: recSt.count,
                interval: recSt.interval,
                wkst: recSt.wkst,
                byweekday: recSt.byweekday,
                bymonth: recSt.bymonth,
                bysetpos: recSt.bysetpos,
                bymonthday: recSt.bymonthday,
                byyearday: recSt.byyearday,
                byweekno: recSt.byweekno,
                byhour: recSt.byhour,
                byminute: recSt.byminute
            }
        }
    }

    const [_recurrenceState, setRecurrenceState] = useState(recurrenceState)

    const rdate = _recurrenceState?.split('RDATE:')[1] || ''

    const [formState, setFormState] = useState<FormState>({
        rule: existingRule,
        default: true,
        until: false,
        RDATE: convertFromStringToDateString(rdate)
    })
    const [showParamsFields, setShowParamsFields] = useState({
        annually: formState.rule.freq === 0,
        monthly: formState.rule.freq === 1,
        weekly: formState.rule.freq === 2,
        daily: formState.rule.freq === 3
    })

    const [onByDayChecked, setOnByDayChecked] = useState(false)

    const [byMonthArr, setByMonthArr] = useState<number[]>(formState.rule.bymonth || [])
    const [byWeekArr, setByWeekArr] = useState<number[]>(formState.rule.bymonthday || [])
    const [byWeekDayObj, setByWeekDayObj] = useState<string|undefined>(formState.rule.byweekday || undefined)
    const [dayPos, setDayPos] = useState<number[]>([])
    const [wkst, setWkst] = useState<string|undefined>(formState.rule.wkst)

    const daysActive = DAYSMAP
        .filter(it=> it.active
            || DAYSByCode(formState.rule.byweekday)
                .find(name=> name === it.day)) || []
    const daysByCodArr = daysActive?.map(it=> it.day)
    const daysByWKSTArr = DAYSByCode([formState.rule.wkst])

    const monthActive = MONTHSMAP
        .filter( mon => mon.active)
    const monthsByCodArr = monthActive?.map(it=> it.month)


    const [byDayArr, setByDayArr] = useState<string[]>(daysByWKSTArr)
    const [byWeekDayArr, setByWeekDayArr] = useState<string[]>(daysByCodArr)

    const [byExclDayArr, setByExclDayArr] = useState<string[]>([])
    const [byExclMonthArr, setByExclMonthArr] = useState<string[]>(monthsByCodArr)
    const [byExclFreqArr, setByExclFreqArr] = useState<string>(FREQ.filter(_fr =>_fr.active)?.map(it=> it.freq)[0])



    const rDateStr = _recurrenceState ? getRecurrenceAndRDate(_recurrenceState).rDate : ''
    const recurrenceStateStringRule = _recurrenceState ? getRecurrenceAndRDate(_recurrenceState).rec : ''
    const recurrenceStateString = recurrenceStateStringRule
        + (rDateStr && rDateStr?.length > 0 ? ('\nRDATE:' + rDateStr) : '' )
    const recurrenceStateText = recurrenceStateStringRule.length > 0 && rrulestr(recurrenceStateStringRule).toText()

    const [showExclude, setShowExclude] = useState(false)
    const [exRule, setExRule] = useState('')

    const onFreqChange = (e: any) =>{
        const val = e.target.value
        setShowExclude(false)

        setShowParamsFields({
            annually: val === '0',
            monthly: val === '1',
            weekly: val === '2',
            daily: val === '3'
        })
        cleanRule()
        setFormState({
            ...formState,
            rule:{
                ...initialRrule,
                freq: getFrequency(val)
            }
        })
    }

    /**
     * Click handler function for days sorted map based table
     * */
    const onDayChoose = (e: any, stateDayArr: string[]) => {

        const cur = e.target.value
        let newArr = stateDayArr

        if (newArr.find(it => it === cur)){
            newArr = newArr.filter(it => it !== cur)
        } else {
            let active: any[] = []
            newArr.forEach(it => {
                const res = DAYSMAP.filter(day => day.day === it)
                active.push(...res)
            })

            DAYSMAP.forEach( day => {
                if (day.day === cur ){
                    active.push(day)
                }
            })

            active = active.sort((a,b) => a.i - b.i)
            newArr = active.map(it => it.day)
        }

        return newArr
    }


    /**
     * Click handler function for months sorted map based table
     * */
    const onMonthChoose = (e: any, stateMonthArr: string[]) => {

        const cur = Number(e.target.value)
        const curName = MONTHSByCode([cur])[0]
        let newArr = stateMonthArr

        if (newArr.find(it => it === curName)){
            newArr = newArr.filter(it => it !== curName)
        } else {
            let active: any[] = []
            newArr.forEach(it => {
                const res = MONTHSMAP.filter(cm => cm.month === it)
                active.push(...res)
            })

            MONTHSMAP.forEach( cm => {
                if (cm.i === cur ){
                    active.push(cm)
                }
            })

            active = active.sort((a,b) => a.i - b.i)
            newArr = active.map(it => it.month)
        }

        return newArr
    }

    const onByDayChange = () => {
        setShowExclude(false)
        setOnByDayChecked(!onByDayChecked)
    }

    const onSelectByDayPosition = (e: any) => {
        setShowExclude(false)
        setDayPos([Number(e.target.value)])
        setFormState({
            ...formState,
            rule:{
                ...formState.rule,
                bysetpos: [Number(e.target.value)],
                byweekday: [byWeekDayObj]
            }
        })

    }

    const onSelectByDayName = (e: any) => {
        setByWeekDayObj(e.target.value)
        setFormState({
            ...formState,
            rule:{
                ...formState.rule,
                bysetpos: dayPos || [1],
                byweekday: [e.target.value]
            }
        })
    }

    const onClickByDayName = (e: any) => {
        e.preventDefault()

        const newArr = onDayChoose(e, byWeekDayArr)

        setByWeekDayArr(newArr)
        setFormState({
            ...formState,
            rule:{
                ...formState.rule,
                byweekday: newArr
            }
        })
    }

    const onClickByMonth = (e: any)=> {
        e.preventDefault()

        const val = e.target.value
        const tempArr = byMonthArr
        let newTempArr: any[] = []

       if (tempArr.includes(Number(val)) ){
            newTempArr = tempArr.filter(item => item !== Number(val))
       } else {
           newTempArr = [...byMonthArr, Number(val)]
       }
        setByMonthArr(newTempArr)

        setFormState({
            ...formState,
            default: false,
            rule:{
                ...formState.rule,
                bymonth: newTempArr
            }
        })
    }

    const onClickByWeekDay = (e: any)=> {
        e.preventDefault()

        let newTempArr: any[] = []
        const val = e.target.value
        const tempArr = byWeekArr


        if (tempArr.includes(Number(val)) ){
            newTempArr = tempArr.filter(item => item !== Number(val))
        } else {
            newTempArr = [...byWeekArr, Number(val)]
        }

        setByWeekArr(newTempArr)

        setFormState({
            ...formState,
            rule: {
                ...formState.rule,
                bymonthday: newTempArr
            }
        })
    }

    const onClickByDay = (e: any)=> {

        e.preventDefault()

        const val = e.target.value
        const tempArr: string[] = []
        const item = DAYS.find(it=> it === val)

        if (tempArr.find(item => item === val) ){
            const filteredArr = tempArr.filter( it => it !== val)
            setByDayArr(filteredArr)
        } else {
            item && tempArr.push(item)
            setByDayArr(tempArr)
        }


        tempArr && setWkst(tempArr[0])

        setFormState({
            ...formState,
            rule:{
                ...formState.rule,
                wkst: tempArr[0]
            }
        })
    }

    const onRDateChoose = (date: Date) => {
        const dateString = date.toISOString()

        setFormState({
            ...formState,
            RDATE: dateString
        })

        let str = recurrenceStateString
        if (str.includes('RDATE:')){
            str = str.split('RDATE:')[0]
        }
        const RDATED = '\nRDATE:' + convertISOStringToString(dateString)

        const strRes = rDate({rDate:RDATED, cur: str})
        setRecurrenceState(strRes)
        onSubmit(strRes)
    }

    const onExcludeByDay = (e: any)=> {

        e.preventDefault()

        const arr =  onDayChoose(e, byExclDayArr)
        setByExclDayArr(arr)

        const res = arr
            .map( day => day.substr(0,2)
            .toUpperCase())
            .join(',')
        let resStr = ''

        if (res.length > 0){
            resStr = `;BYDAY=${res}`
        } else {
            resStr = ''
        }

        if(exRule.length > 0 && !exRule.includes('BYDAY')){
            setExRule(`${exRule}${resStr}`)
        } else {
            setExRule(`FREQ=${byExclFreqArr}${resStr}`)
        }
    }

    const onExcludeByMonth = (e: any)=> {

        e.preventDefault()

        const arr =  onMonthChoose(e, byExclMonthArr)
        setByExclMonthArr(arr)

        const res = MONTHSByName(arr).join(',')
        let resStr = ''

        if (res.length > 0){
            resStr = `;BYMONTH=${res}`
        } else {
            resStr = ''
        }
        if (exRule.length > 0 && !exRule.includes('BYMONTH')){
            setExRule(`${exRule}${resStr}`)
        } else {
            setExRule(`FREQ=${byExclFreqArr}${resStr}`)
        }
    }

    const onExcludeSetFreq = (e: any)=> {
        e.preventDefault()

        const val = e.target.value
        const tempArr: string[] = []
        const item = FREQ.find(it=> it.freq === val)

        if (tempArr.find(item => item === val) ){
            const filteredArr = tempArr.filter( it => it !== val)
            setByExclFreqArr(filteredArr[0])
        } else {
            item && tempArr.push(item.freq)
            setByExclFreqArr(tempArr[0])
        }

    }


    return <>
        <div className="mt-3">

            <h3 className="mt-4 mb-4 text-center">
                <span className="action-button action-button--with-chevron link-secondary">
                    Task Recurrence Schedule
                </span>
            </h3>

                <div className="collapsible-aria">
                    <Row>
                        <Col md={'6'}>
                            <FormGroup className="mb-3">
                                <InputGroup.Text>Frequency</InputGroup.Text>
                                <Form.Select name="freq"
                                             onChange={(e)=> onFreqChange(e)}
                                             defaultValue={formState.rule.freq}
                                >
                                    <option value="0">Annually</option>
                                    <option value="1">Monthly</option>
                                    <option value="2">Weekly</option>
                                    <option value="3">Daily</option>
                                </Form.Select>
                            </FormGroup>
                        </Col>
                    </Row>
                    {(showParamsFields.annually || showParamsFields.monthly)
                    && <Row>
                        <Col>
                            <FormGroup className="mb-3">
                                {showParamsFields.annually
                                && <Table className="selectable-table">
                                        <tbody>
                                        <tr>
                                            {[{n:'Jan',c:1},{n:'Feb', c:2}, {n:'Mar', c:3}, {n:'Apr',c:4}]
                                                .map((item)=><td key={`months_-1-${item.c}`}>
                                                    <button value={item.c}
                                                            className={`${byMonthArr.includes(item.c)? 'active' : 'inactive'}`}
                                                            onClick={(e: any)=>{onClickByMonth(e)}}>{item.n}</button>
                                                </td>)}
                                        </tr>
                                        <tr>
                                            {[{n:'May', c:5},{n:'Jun', c:6}, {n:'Jul', c:7}, {n:'Aug', c:8}]
                                                .map((item)=><td key={`months_-1-${item.c}`}>
                                                    <button value={item.c} className={`${byMonthArr.includes(item.c)? 'active' : 'inactive'}`}
                                                            onClick={(e: any)=>{onClickByMonth(e)}}>{item.n}</button>
                                                </td>)}
                                        </tr>
                                        <tr>
                                            {[{n:'Sep', c:9},{n:'Oct', c:10}, {n:'Nov', c:11}, {n:'Dec', c:12}]
                                                .map((item)=><td key={`months_-1-${item.c}`}>
                                                    <button value={item.c} className={`${byMonthArr.includes(item.c)? 'active' : 'inactive'}`}
                                                            onClick={(e: any)=>{onClickByMonth(e)}}
                                                    >{item.n}</button>
                                                </td>)}
                                        </tr>
                                        </tbody>
                                    </Table>
                                }
                                {showParamsFields.monthly
                                && <Table className="selectable-table">
                                    <tbody>
                                    <tr key={'rec-1'}>
                                        {[1,2,3,4,5,6,7].map((item,i)=>
                                            <td key={`rec_1_${i}`}>
                                                <button value={item} className={`${byWeekArr.includes(item)? 'active' : 'inactive'}`}
                                                    onClick={(e: any)=>{onClickByWeekDay(e)}}>{item}</button>
                                            </td>)}
                                    </tr>
                                    <tr key={'rec-2'}>
                                        {[8,9,10,11,12,13,14].map((item,i)=>
                                            <td key={`rec_2_${i}`}>
                                                <button value={item} className={`${byWeekArr.includes(item)? 'active' : 'inactive'}`}
                                                        onClick={(e: any)=>{onClickByWeekDay(e)}}>{item}</button>
                                            </td>)}
                                    </tr>
                                    <tr key={'rec-3'}>
                                        {[15,16,17,18,19,20,21].map((item,i)=>
                                            <td key={`rec_3_${i}`}>
                                                <button value={item} className={`${byWeekArr.includes(item)? 'active' : 'inactive'}`}
                                                        onClick={(e: any)=>{onClickByWeekDay(e)}}>{item}</button>
                                            </td>)}
                                    </tr>
                                    <tr key={'rec-4'}>
                                        {[22,23,24,25,26,27,28].map((item,i)=>
                                            <td key={`rec_4_${i}`}>
                                                <button value={item} className={`${byWeekArr.includes(item)? 'active' : 'inactive'}`}
                                                        onClick={(e: any)=>{onClickByWeekDay(e)}}>{item}</button>
                                            </td>)}
                                    </tr>
                                    <tr key={'rec-5'}>
                                        {[29,30,31,-4,-3,-2,1].map((item,i)=>
                                            <td key={`rec_5_${i}`}>
                                                <button value={item} className={`${byWeekArr.includes(item)? 'active' : 'inactive'}`}
                                                        onClick={(e: any)=>{onClickByWeekDay(e)}}>{item}</button>
                                            </td>)}
                                    </tr>
                                    </tbody>
                                </Table>
                                }
                                <Row>
                                    <Col md={'auto'}>
                                        <FormGroup className={'mt-1'}>
                                            <InputGroup>
                                                <Form.Check
                                                    type={'checkbox'}
                                                    id={`by_day`}
                                                    label={'On the'}
                                                    name="by_day"
                                                    checked={onByDayChecked}
                                                    onChange={()=>onByDayChange()}
                                                />
                                            </InputGroup>
                                        </FormGroup>
                                    </Col>
                                    <Col md={'auto'}>
                                        <Form.Select name="position"
                                                     disabled={!onByDayChecked}
                                                     onChange={ (e: any)=> onSelectByDayPosition(e)}
                                        >
                                            <option value="1">first</option>
                                            <option value="2">second</option>
                                            <option value="3">third</option>
                                            <option value="4">fourth</option>
                                            <option value="-1">last</option>
                                            <option value="-2">second last</option>
                                            <option value="-3">third last</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={'auto'}>
                                        <Form.Select name="weekday"
                                                     disabled={!onByDayChecked}
                                                     onChange={ (e: any)=> onSelectByDayName(e)}
                                                     defaultValue={formState.rule.byweekday || 'Mon'}
                                        >
                                            <option value="Mon">Monday</option>
                                            <option value="Tue">Tuesday</option>
                                            <option value="Wen">Wednesday</option>
                                            <option value="Thu">Thursday</option>
                                            <option value="Fri">Friday</option>
                                            <option value="Sat">Saturday</option>
                                            <option value="Sun">Sunday</option>
                                        </Form.Select>
                                    </Col>
                                    <Col>
                                        <div className={'text-muted'}>
                                           * If given, it must be either an integer, or a sequence of integers, positive or negative. Each given
                                            integer will specify an occurrence number, corresponding to the nth occurrence of the rule inside
                                            the frequency period. For example, a
                                            <code className="ms-1 me-1">bysetpos</code> of
                                            <code className="ms-1 me-1">-1</code> if combined with a
                                            <code className="ms-1 me-1">RRule.MONTHLY</code>
                                            frequency, and a byweekday of (
                                            <code className="ms-1 me-1">RRule.MO</code>,
                                            <code className="ms-1 me-1">RRule.TU</code>,
                                            <code className="ms-1 me-1">RRule.WE</code>,
                                            <code className="ms-1 me-1">RRule.TH</code>,
                                            <code className="ms-1 me-1">RRule.FR</code>), will result in the last work day of every month.
                                        </div>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>}
                    {showParamsFields.weekly
                    && <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text>Every (choose number) week</InputGroup.Text>
                                    <Form.Control type={'number'}
                                                  onChange={(e)=> {
                                                      setFormState({
                                                          ...formState,
                                                          rule:{
                                                              ...formState.rule,
                                                            byweekno: [Number(e.target.value) || 0]
                                                          }
                                                      })
                                                  }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col>
                            <FormGroup className="mb-3">
                                <Table className="selectable-table">
                                    <tbody>
                                    <tr>
                                        <td>Current:</td>
                                        <td>{DAYS.find((it, i)=> i === (wkst && Number(wkst))) || wkst}</td>
                                    </tr>
                                    <tr><td colSpan={7}><p>Start from day:</p></td></tr>
                                    <tr>
                                        {DAYS.map((item, i) => <td key={`weekday_${i}`}>
                                            <button value={item}
                                                    className={`${byDayArr.find(it=> it === item )
                                                        ? 'active' : 'inactive'}`}
                                                    onClick={
                                                        (e: any)=>{onClickByDay(e)}
                                                    }>{item}</button>
                                        </td>)}
                                    </tr>
                                    </tbody>
                                </Table>
                            </FormGroup>
                        </Col>
                    </Row>}
                    {(showParamsFields.monthly || showParamsFields.weekly)
                    && <Row>
                        <Col md={'6'}>
                            <FormGroup className="mb-3">
                                <Table className="selectable-table">
                                    <tbody>
                                    <tr>
                                        <td>Current:</td>
                                        <td colSpan={6}>{byWeekDayArr.map((it: string, i: number)=> <span key={i+'_curByWeekD'}>
                                            {it},</span>)}</td>
                                    </tr>
                                    <tr><td colSpan={7}><p>Every:</p></td></tr>
                                    <tr>
                                        {DAYSMAP.map((item, i) => <td key={`weekday_${i}`}>
                                            <button value={item.day}
                                                    className={`${byWeekDayArr.find(it=> it === item.day )
                                                        ? 'active' : 'inactive'}`}
                                                    onClick={
                                                        (e: any)=>{onClickByDayName(e)}
                                                    }>{item.day}</button>
                                        </td>)}
                                    </tr>
                                    </tbody>
                                </Table>
                            </FormGroup>
                        </Col>
                    </Row>}
                    {showParamsFields.daily
                    && <Row>
                        <Col>
                            <FormGroup className="mb-3">
                                <ul className="ul">
                                    <li className="until">
                                        <Form.Check label="Repeat until:"
                                                    type="checkbox"
                                                    name="limit"
                                                    checked={formState.until}
                                                    onChange={e =>{
                                                        setFormState({
                                                            ...formState,
                                                            until: e.target.checked
                                                        })
                                                    }}
                                        />
                                        <InputGroup className="custom-input-group">
                                            <InputGroup.Text>Date:</InputGroup.Text>
                                            <DatePicker selected={formState?.rule.until
                                                ? new Date(formState.rule.until)
                                                : new Date()}
                                                        disabled={!formState.until}
                                                        showYearDropdown
                                                        dateFormat="MMMM d, yyyy"
                                                        onChange={(date:Date)=>{
                                                            const dateString = date.toISOString()
                                                            setFormState({
                                                                ...formState,
                                                                rule:{
                                                                    ...formState.rule,
                                                                    until: dateString
                                                                }
                                                            })
                                                        }}/>
                                        </InputGroup>
                                    </li>
                                    <li className="count">
                                        <InputGroup>
                                            <InputGroup.Text>Occurs:</InputGroup.Text>
                                            <Form.Control  name="count" type={'number'}  value={formState?.rule.count || 1}
                                                           onChange={(e)=>{
                                                               setFormState({
                                                                   ...formState,
                                                                   rule:{
                                                                       ...formState.rule,
                                                                        count: e.target.value ? Number(e.target.value) : 1
                                                                   }
                                                               })
                                                           }}
                                            />
                                            <InputGroup.Text className="recurrence-label"> times</InputGroup.Text>
                                        </InputGroup>
                                    </li>
                                    <li className="interval">
                                        <InputGroup>
                                            <InputGroup.Text>Every</InputGroup.Text>
                                            <Form.Control name="interval" type={'number'}
                                                          value={formState?.rule.interval || 1}
                                                          onChange={(e)=>{
                                                              setFormState({
                                                                  ...formState,
                                                                  rule:{
                                                                      ...formState.rule,
                                                                    interval: e.target.value ? Number(e.target.value) : 1
                                                                  }
                                                              })
                                                          }}
                                            />
                                            <InputGroup.Text>day(s)</InputGroup.Text>
                                        </InputGroup>
                                    </li>
                                </ul>
                            </FormGroup>
                        </Col>
                    </Row>}
                    <div className="collapsible-aria__highlighted">
                        <Row>
                            <Col className="text-center">
                                <Button className="btn-light btn-outline-secondary"
                                        onClick={()=>{
                                            setRecurrenceState(createRrule(formState.rule))
                                            setFormState({rule: existingRule, default: true, until: false})
                                            setShowExclude(false)
                                            setExRule('')
                                            cleanRule()
                                        }}
                                >Clear recurrence</Button>
                            </Col>
                            <Col className="text-center">
                                <Button className="btn-light btn-outline-success"
                                        onClick={(e)=>{
                                            setFormState({
                                                ...formState,
                                                rule: formState.rule,
                                                default: false
                                            })
                                            const str = createRrule(formState.rule)
                                            setRecurrenceState(str)
                                            onSubmit(str)
                                }}>Update recurrence</Button>
                            </Col>
                            {!formState.default && <Col className="text-center">
                                <InputGroup>
                                    <Form.Check
                                        type={'checkbox'}
                                        id={`exclude_occur`}
                                        label={'Exclude these occurrences'}
                                        name="mode"
                                        checked={showExclude}
                                        onChange={(e: any)=>{
                                            setShowExclude(e.target.checked)
                                        }}
                                    />
                                </InputGroup>
                            </Col>}
                        </Row>
                    </div>
                    <Row className="mt-3 mb-2">
                        <Col md={'4'}>
                            <Table className="selectable-table">
                                <tbody>
                                <tr>
                                    <td key={'cur_date_label'}>
                                        Current:
                                    </td>
                                    <td key={'cur_date_val'}>
                                        <Form.Label className="ms-1 mt-1 text-info"> { (formState?.RDATE && formState?.RDATE.includes('T')
                                            ? formState?.RDATE.split('T')[0]
                                            : formState?.RDATE)
                                        || 'Choose required date'}</Form.Label>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <InputGroup className="custom-input-group mb-2 mt-2">
                                            <InputGroup.Text>Date Start:</InputGroup.Text>
                                            <DatePicker
                                                selected={formState?.RDATE
                                                    ? new Date(formState?.RDATE)
                                                    : new Date()}
                                                showYearDropdown
                                                dateFormat="MMMM d, yyyy"
                                                onChange={(date:Date)=>onRDateChoose(date)}/>
                                        </InputGroup>
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>

                        {showExclude
                        &&<Col className="text-center">
                            <InputGroup className='mt-3'>
                                <Table className='selectable-table'>
                                    <tbody>
                                    <tr>
                                        {FREQ.map((item, i) =><td key={`freq_${i}`}>
                                                <button  value={item.freq}
                                                         className={`${byExclFreqArr === item.freq
                                                             ? 'active' : 'inactive'}`}
                                                         onClick={
                                                             (e: any)=>{onExcludeSetFreq(e)}
                                                         }>{item.freq.toLowerCase()}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    </tbody>
                                </Table>
                            </InputGroup>
                            <InputGroup>
                                <Table className='selectable-table'>
                                    <tbody>
                                    <tr>
                                        {DAYSMAP.map((item, i) =><td key={`day__${i}`}>
                                                <button  value={item.day}
                                                         className={`${byExclDayArr.find(it=> it === item.day )
                                                             ? 'active' : 'inactive'}`}
                                                         onClick={
                                                             (e: any)=>{onExcludeByDay(e)}
                                                         }>{item.day}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    </tbody>
                                </Table>
                            </InputGroup>
                            <InputGroup className='mt-3'>
                                <Table className='selectable-table'>
                                    <tbody>
                                    <tr>
                                        {MONTHSMAP.map((item, i) =><td key={`month-name__${i}`}>
                                                <button  value={item.i}
                                                         className={`${byExclMonthArr.find(it=> it === item.month )
                                                             ? 'active' : 'inactive'}`}
                                                         onClick={
                                                             (e: any)=>{onExcludeByMonth(e)}
                                                         }>{item.month}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    </tbody>
                                </Table>
                            </InputGroup>
                            {exRule && byExclFreqArr && byExclMonthArr && byExclDayArr
                            && <div className='d-flex justify-content-end w-100'>
                                <Button className='btn-light btn-outline-danger'
                                        onClick={(e)=>{
                                            let str = ''
                                            if (recurrenceStateString.length > 0 && recurrenceStateString.includes('EXRULE:')){
                                               str = excludeRule({rule: exRule, cur: recurrenceStateString.split('EXRULE:')[0]})
                                            } else {
                                              str =  excludeRule({rule: exRule, cur: recurrenceStateString})
                                            }
                                            onSubmit(str)
                                        }}>
                                    Exclude selected and update
                                </Button>
                            </div>}
                        </Col>}
                    </Row>
                </div>
            <Row>
                <Col>
                    <Alert variant="success" className="mt-3 mb-5 overflow-a">
                        <Alert.Heading>Result recurrence string</Alert.Heading>
                        <hr />
                        {!formState.default &&<>
                            <p>
                                {recurrenceStateString}
                            </p>
                            <p>
                                {recurrenceStateText}
                            </p>
                            <p>
                                {showExclude && 'Excluded:'} {exRule}
                            </p>
                        </>}
                        {formState.default && <>
                            <p>Please select required recurrence parameters and press 'update' to see resulted iCalendar string</p>
                            <p>Current:</p>
                            <p>{_recurrenceState}</p>
                        </>}
                    </Alert>
                </Col>
            </Row>
        </div>
    </>
}