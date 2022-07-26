import React, {useEffect, useState} from 'react';
import './app.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {RecurrenceWidget} from "./recurrence-widget";
import {createRrule, initialRruleString} from "./recurrenceSlice"
import {Col, Row} from "react-bootstrap";

function App() {
    const [formState, setFormState] = useState( {
        recurrence: '',
        time_zone_user: Intl.DateTimeFormat()
            .resolvedOptions().timeZone
    })
    const [widgetState, setWidgetState] = useState(formState.recurrence)

    const onSubmit = (str: string) =>{
        console.log(str)
        setWidgetState(str)
       return setFormState({
            ...formState,
            recurrence:  str
        })
    }

    useEffect(()=>{
        setWidgetState(createRrule(initialRruleString))
    },[])

    return (
        <div className="App">
            <div className="container">
              <div className="wrapper">
                  <Row>
                      <Col>
                          {widgetState
                          && <RecurrenceWidget
                              onSubmit={onSubmit}
                              recurrenceState={widgetState}/>
                          }
                      </Col>
                  </Row>
                  <Row>
                      <Col md={'6'} className={'text-center overflow-a'}>
                          <p>You have submitted: {formState.recurrence} </p>
                      </Col>
                  </Row>
              </div>
            </div>
            <footer className="footer bottom-0 bg-dark">
                <div className="container py-4">
                    <div className="copyright text-center text-white">
                        <span>v. {process.env.REACT_APP_VERSION}</span>
                    </div>
                </div>
            </footer>
        </div>
  );
}

export default App

