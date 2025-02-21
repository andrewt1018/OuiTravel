
const NoChatSelected = () => {
    return (
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-[#f7fbfc]">
            <div className="max-w-md text-center space-y-6">
                {/* Icon Display */}
                {/* Welcome Text */}
                <h2 className="text-2xl font-bold">Your messages</h2>
                <p className="text-black/60">Select a conversation to start chatting</p>
            </div>
        </div>
    );

};

export default NoChatSelected;