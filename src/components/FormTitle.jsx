const FormTitle = ({title, description}) => {
    return (
        <div className="">
            <h1 className="text-4xl">{title}</h1>
            <p className="text-sm text-gray-700">{description}</p>
        </div>
    )
}

export default FormTitle