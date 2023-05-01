import React, { useState } from 'react';

import './QrCodeGeneratorCss.css';
let qrCodeObj = {
    qrText: '',
    qrEmail: '',
    qrColor: ''
}
let colors = [{
    id: 1,
    color: '#DFFF00',
    selected: false
},
{
    id: 2,
    color: '#FFBF00',
    selected: false
}, {
    id: 3,
    color: '#FF7F50',
    selected: false
},
{
    id: 4,
    color: '#CCCCFF',
    selected: false
}, {
    id: 5,
    color: '#0000FF',
    selected: false
},
{
    id: 6,
    color: '#808000',
    selected: false
},
{
    id: 7,
    color: '#800000',
    selected: false
},
{
    id: 8,
    color: '#808080',
    selected: false
},

]
function QrCodeGenerator() {
    const [fieldValues, setFieldValues] = useState({ ...qrCodeObj });
    const [platteColors, setPlatteColors] = useState([...colors]);
    const [errors, setError] = useState({});
    // useEffect(() => {

    //     setFieldValues({ ...qrCodeObj })
    // }, [])
    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFieldValues({
            ...fieldValues,
            [name]: value
        })
    }
    const onClickHandle = (id) => {
        for (let i = 0; i < platteColors.length; i++) {
            if (platteColors[i].id === id) {
                setFieldValues({ ...fieldValues, qrColor: platteColors[i].color })
                platteColors[i].selected = true
            } else {
                platteColors[i].selected = false
            }
        }
        setPlatteColors([...platteColors])

    }
    const checkValidation = (obj) => {
        const { qrText, qrEmail, qrColor } = obj
        let validatedObj = {
            qrText: false,
            qrEmail: false,
            qrColor: false,
            message:false
        }
        if (qrText === '') {
            validatedObj.qrText = true;
       }
       if (qrEmail ===   '') {
        validatedObj.qrEmail = true;
    }
    if (qrEmail !==   '' ) {
        var pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; 
        if(!qrEmail.match(pattern)){
            validatedObj.qrEmail = true;
            validatedObj.message = 'Your Email is not Valid';
        }
        
    }
    if (qrColor ===   '') {
        validatedObj.qrColor = true;
    }
    return validatedObj;

    }
    const handleSubmit = () => {
       
        let errorsObj = checkValidation(fieldValues);
        let isErrorExist =  Object.keys(errorsObj).every((k) => errorsObj[k]===false)
        console.log('errorsObj',errorsObj)
        console.log('isErrorExist',isErrorExist)
       if(isErrorExist === true){
        setError({})
        console.log('fieldValues', fieldValues)
        
       }
       else{
        setError({...errorsObj})
        console.log('errors',errors)
       }

    }
    return (
        <div className="container">
            <h1>QR Code Email Sender</h1>

            <div className="row">
                <div className="col-25">
                    <label>Text you Want to make QR Code</label>
                </div>
                <div className="col-75">
                    <input
                        type="text"
                        name="qrText"
                        placeholder="Text you Want to make QR Code"
                        value={fieldValues.qrText}
                        onChange={handleFieldChange}
                    />
                    {errors && errors.qrText && (<span style={{ color: 'red' }}>Field is required</span>)}
                </div>
            </div>
            <div className="row">
                <div className="col-25">
                    <label>Write Your Email adddress at which QR Code will be sent</label>
                </div>
                <div className="col-75">
                    <input
                        type="text"
                        name="qrEmail"
                        placeholder="Write Your Email adddress at which QR Code will be sent"
                        value={fieldValues.qrEmail}
                        onChange={handleFieldChange}
                    />
                    {errors && (errors.qrEmail && errors.message!==false ) ? (<span style={{ color: 'red' }}>{errors.message}</span>):errors.qrEmail ===true ? (<span style={{ color: 'red' }}>Field is required</span>):null }
                </div>
            </div>
            <div className="row">
                <div className="col-25">
                    <label>Select Your QR /code Background Color</label>
                </div>
                <div className="col-75">
                    {platteColors && platteColors.map((item, i) => {
                        return (
                            item && item.selected ? (
                                <div
                                    key={i}
                                    style={{
                                        display: 'inline-block',
                                        marginLeft: '5px',
                                        width: '100px',
                                        height: '100px',
                                        background: `${item.color}`,
                                        border: '3px solid black',

                                    }}></div>) : (
                                <div
                                    key={i}
                                    style={{
                                        display: 'inline-block',
                                        marginLeft: '5px',
                                        width: '100px',
                                        height: '100px',
                                        background: `${item.color}`,
                                    }} onClick={() => onClickHandle(item.id)}>

                                </div>)
                        )


                    })}
                    {errors && errors.qrColor && (<span style={{ color: 'red' }}>Please Select Any Color</span>)}
                </div>
            </div>
            <div className="row">
                <button className='button' onClick={handleSubmit}>Submit</button>
            </div>

        </div>
    );
}

export default QrCodeGenerator;
