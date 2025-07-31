import React, { useState } from 'react'

interface ProfileCreationProps {
    checkProfile: () => void;
    profileContract: any;
    account: string;
}

const ProfileCreation = ({ checkProfile, profileContract, account }: ProfileCreationProps) => {
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);

    const createProfile = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setLoading(true);
            await profileContract.methods.setProfile(username, bio).send({ from: account });
            await checkProfile();
        } catch (error) {
            console.error("Error creating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col mt-5 p-5 border-[1px] border-[#ccc] rounded-lg">
            <h2 className='text-[#1da1f2] mb-5'>Create your profile</h2>
            <form onSubmit={createProfile}>
                <div className='w-full flex flex-col gap-1'>

                <label className='text-[#65676b]'>
                    Username:
                </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-[10px] rounded-lg border-[1px] border-[#ccc] mb-[10px]"
                    />
                </div>
                <div className='w-full flex flex-col gap-1'>
                <label className='text-[#65676b]'>
                    Bio:
                </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full p-[10px] rounded-lg border-[1px] border-[#ccc]"
                    />

                </div>
                <button type="submit" className="bg-[#1da1f2] text-white border-none py-3 px-5 rounded-xl cursor-pointer mt-3">
                    {loading ? <div className="spinner"></div> : <>Create Profile</>}
                </button>
            </form>
        </div>
    )
}

export default ProfileCreation
