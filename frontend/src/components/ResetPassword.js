import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

function ResetPassword() {
    const { token } = useParams();
    const [newPass, setNewPass] = useState("");
    const [verifyPass, setVerifyPass] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3001/api/auth/reset-token-verify/${token}`
                );
                if (!response.ok) {
                    throw new Error('Invalid or expired token.');
                }
                setValidToken(true);
            } catch (error) {
                setError(error.message);
                setValidToken(false);
                setTimeout(() => {
                    navigate('/reset-password');
                }, 3000); 
            }
        };
        verifyToken();
    }, [token, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPass !== verifyPass) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:3001/api/auth/reset-password/${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newPass }),
                }
            );

            if (!response.ok) {
                throw new Error('Error resetting new password');
            }

            alert('Your password has been reset. You will be redirected to the Login page');
            navigate('/login');
        } catch (error) {
            alert('Error resetting password. Please try again.');
        } finally {
            setLoading(false); 
        }
    };

    if (error) {
        return (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md text-center">
                {error}
            </div>
        );
    }

    if (!validToken) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-gray-700">Validating token...</span>
                </div>
            </div>
        );
    }

    return (
        <main id="content" role="main" className="w-full max-w-md mx-auto p-6">
            <div className="mt-7 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
                <div className="p-4 sm:p-7">
                    {validToken ? (
                        <>
                            <div className="text-center">
                                <h1 className="block text-2xl font-bold text-gray-800 dark:text-white mb-4">
                                    Reset your password
                                </h1>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-5">
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="newPass"
                                            className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                                        >
                                            New password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPass"
                                            name="newPass"
                                            className="py-3 px-4 block w-full border-2 border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                                            required
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="verifyPass"
                                            className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                                        >
                                            Confirm new password
                                        </label>
                                        <input
                                            type="password"
                                            id="verifyPass"
                                            name="verifyPass"
                                            className="py-3 px-4 block w-full border-2 border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                                            required
                                            value={verifyPass}
                                            onChange={(e) => setVerifyPass(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm ${loading ? 'cursor-wait' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                                <span className="ml-2">Resetting...</span>
                                            </>
                                        ) : (
                                            "Reset password"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <p className="text-red-600 mt-4 text-center">Invalid or expired reset token.</p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ResetPassword;
