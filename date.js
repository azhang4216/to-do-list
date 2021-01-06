exports.getDate = () => {
    const date = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }
    return date.toLocaleDateString("en-US", options);
}

exports.getDay = () => {
    const date = new Date();
    const options = {
        weekday: "long",
    }
    return date.toLocaleDateString("en-US", options);
}