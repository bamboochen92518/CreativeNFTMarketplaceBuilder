'use client';

import React, { useState } from 'react';
import { useContract } from '@/context/contract-context';
import { createCharacter } from '@/utils';

const CreateCharacterBox = ({ display }: { display: boolean }): React.JSX.Element => {
  const [file, setFile] = useState<File | null>(null); // State to store selected file
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [error, setError] = useState<string | null>(null); // Error message state
  const [success, setSuccess] = useState<string | null>(null); // Success message state
  const { contract, accounts } = useContract(); // Access contract and accounts

  if (!display) return <></>;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!contract || accounts.length === 0) {
      setError("No connected wallet or contract instance found.");
      return;
    }

    try {
      setLoading(true);
      // console.log("Uploading character with file:", file.name);
      await createCharacter(contract, accounts[0], file);
      // console.log("Character creation successful!");
      setSuccess("Character created successfully!");
      setFile(null); // Clear the selected file
      setError(null);
    } catch (err) {
      console.error("Error creating character:", err);
      setError("Character creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='
        fixed top-32 left-1/2 transform -translate-x-1/2 z-30
        bg-white text-black p-6 rounded-xl shadow-lg flex flex-col gap-4
        w-[90%] max-w-md
      '
    >
      <p className='text-lg font-bold'>Upload Character</p>
      {error && <p className='text-red-500'>{error}</p>}
      {success && <p className='text-green-500'>{success}</p>}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className='block w-full border border-gray-300 p-2 rounded-lg'
      />
      {file && <p className='text-sm text-gray-700'>Selected: {file.name}</p>}
      <button
        type='submit'
        disabled={loading}
        className={`rounded-lg py-2 px-4 bg-blue-500 text-white 
          hover:bg-blue-600 transition-all 
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? "Creating..." : "Create!"}
      </button>
    </form>
  );
};

export default CreateCharacterBox;
