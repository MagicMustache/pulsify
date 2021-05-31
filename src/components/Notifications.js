import {useEffect, useState} from "react";
import Notification from "react-web-notification";

function Notifications(props) {
    const [ignore, setIgnore] = useState(true)
    const [data, setData] = useState({
        title:"",
        options:null
    })

    useEffect(() => {
        if(props.trigger){
            showNotification()
        }
    }, [props.trigger])

    return (
        <div>
            <Notification
                ignore={ignore}
                notSupported={handleNotSupported}
                onPermissionGranted={handlePermissionGranted}
                onPermissionDenied={handlePermissionDenied}
                onShow={handleNotificationOnShow}
                onClick={handleNotificationOnClick}
                onClose={handleNotificationOnClose}
                onError={handleNotificationOnError}
                timeout={5000}
                title={data.title}
                options={data.options}
            />
        </div>
    )

    function showNotification() {
        if (ignore) {
            return;
        }
        const title1 = "Smile if you would want to keep this song !"
        const body = ''
        const tag = Date.now();
        const logo = require('../images/smile500px.png');
        const icon = logo.default;

        const options1 = {
            tag: tag,
            body: body,
            icon: icon,
            lang: 'en',
            dir: 'ltr',
        }
        setData({title:title1, options:options1})
    }

    function handlePermissionGranted() {
        console.log('Permission Granted');
        setIgnore(false)
    }

    function handlePermissionDenied() {
        console.log('Permission Denied');
        setIgnore(true)
    }

    function handleNotSupported() {
        console.log('Web Notification not Supported');
        setIgnore(true)
    }

    function handleNotificationOnClick(e, tag) {
        console.log(e, 'Notification clicked tag:' + tag);
    }

    function handleNotificationOnError(e, tag) {
        console.log(e, 'Notification error tag:' + tag);
    }

    function handleNotificationOnClose(e, tag) {
        console.log(e, 'Notification closed tag:' + tag);
    }

    function handleNotificationOnShow(e, tag) {
        console.log(e, 'Notification shown tag:' + tag);
    }
}

export default Notifications
