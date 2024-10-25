const isEmailValid = (value: string): boolean => {
    return (/^[a-zA-Z0-9._%+-]+@hanyang\.ac\.kr$/).test(value);
};

export default isEmailValid;
