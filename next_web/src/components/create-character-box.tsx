import React from 'react';

const CreateChracaterBox = ({
  display,
  callback
}: {
  display: boolean,
  callback: () => void
}): React.JSX.Element => {
  if (!display) {
    return <></>;
  }

  return (
    <form
      action={() => {
        callback();
      }}
      className='
      rounded-xl bg-white p-4 flex flex-col gap-4
      fixed top-32 left-1/2 transform -translate-x-1/2 z-30
    '>
      <p className='text-bold text-black'>Upload Character</p>
      <input className='text-base' type="file" accept="image/*" />
      <button
        type='submit'
        className='rounded-xl bg-blue-400 hover:bg-slate-500'
      >Create!</button>
    </form>
  )
}

export default CreateChracaterBox;
