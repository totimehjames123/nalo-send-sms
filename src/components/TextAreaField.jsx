const TextAreaField = ({ title, placeholder, moreClass, onChange, value }) => {
    return (
        <div className={`${moreClass}`}>
            <p className={`text-gray-500 text-xs mb-2`}>{title}</p>
            <textarea
                rows={10}
                placeholder={placeholder}
                onChange={onChange} // Call the onChange function passed as a prop
                value={value} // Set the textarea value from the prop
                className="border p-4 w-full rounded-md"
            />
        </div>
    );
};

export default TextAreaField;
