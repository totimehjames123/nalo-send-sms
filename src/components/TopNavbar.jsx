const TopNavbar = () => {
    return <div> 
     <div className='flex justify-between p-2'>     
        <a className='flex bg-blue-100 font-medium justify-center text-blue-400 rounded-md items-center gap-2 pl-2 text-lg border border-blue-200 -pr-1 p-1'>SMS<span className='bg-blue-500 text-white p-1 px-3 rounded-md'>Send</span></a>
        <div className='flex gap-1'>
          {/* <button className='bg-black hover:bg-gray-800 rounded-md px-6 text-white'>Sign up</button>
          <button className='bg-blue-500 hover:bg-blue-300 rounded-md px-6 text-white'>Login</button> */}
        </div>
      </div>
    </div>
}

export default TopNavbar