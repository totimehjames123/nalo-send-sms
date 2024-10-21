const FormButton = ({title, icon, moreClass}) => {
    return (
        <button className={`p-5 text-white bg-blue-500 gap-3 justify-center flex items-center w-full rounded-lg ${moreClass}`}>
             {icon} {title}
        </button>
    )
}

export default FormButton