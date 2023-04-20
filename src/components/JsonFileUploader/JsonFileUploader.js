import React, { useState } from 'react';

function JsonFileUploader() {
    const [errors, setErrors] = useState([]);
    const [timezones, setTimezones] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setErrors([]);
            setTimezones([]);
            setCurrentPath([]);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const errorValues = findErrors(data, []);
                const timezoneValues = findTimezones(data);

                if (errorValues.length > 0) {
                    setErrors(errorValues);
                } else {
                    setErrors([]);
                }

                if (timezoneValues.length > 0) {
                    setTimezones(timezoneValues);
                } else {
                    setTimezones([]);
                }
            } catch (error) {
                setErrors([error]);
                setTimezones([]);
            }
        };
        reader.readAsText(file);
    };

    const findErrors = (data, path) => {
        const errorValues = [];

        for (const key in data) {
            const value = data[key];
            const current = [...path, key];

            if (key === 'error') {
                errorValues.push({ value: value, path: current });
            } else if (typeof value === 'object') {
                const subErrorValues = findErrors(value, current);
                if (subErrorValues && subErrorValues.length > 0) {
                    errorValues.push(...subErrorValues);
                }
            }
        }

        return errorValues;
    };

    const findTimezones = (data) => {
        const timezoneValues = [];

        for (const key in data) {
            const value = data[key];

            if (key === 'timezone') {
                const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
                timezoneValues.push({ key: key, value: `${value} (${timezoneName})` });
            } else if (typeof value === 'object') {
                const subTimezoneValues = findTimezones(value);
                if (subTimezoneValues && subTimezoneValues.length > 0) {
                    timezoneValues.push(...subTimezoneValues);
                }
            }
        }

        return timezoneValues;
    };

    return (
        <div>
            <input type="file" onChange={handleFileUpload} />
            {errors.length > 0 && (
                <div>
                    <h2>Errors:</h2>
                    <ul>
                        {errors.map((error, index) => {
                            if (error && error.value && error.value.name && error.value.name.trim() !== '' && error.value.message && error.value.message.trim() !== '') {
                                return (
                                    <li key={index}>
                                        <strong>Path:</strong> {error.path.join(' > ')}<br />
                                        <strong>Name:</strong> {error.value.name}<br />
                                        <strong>Message:</strong> {error.value.message}<br />
                                    </li>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </ul>
                </div>
            )}
            {timezones.length > 0 && (
                <div>
                    <h2>Timezones:</h2>
                    <ul>
                        {timezones.map((timezone, index) => {
                            if (timezone && timezone.key && timezone.value && timezone.value.trim() !== '') {
                                return (
                                    <li key={index}>
                                        {timezone.value}<br />
                                    </li>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default JsonFileUploader;
