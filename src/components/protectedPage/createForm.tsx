import React, { useState, useEffect } from "react";

// THIS SUCKSSSSS
const CreateForm = () => {
  // State management for passwords
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Password complexity validation
  const validatePasswordComplexity = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Check if passwords match and meet complexity requirements
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      console.log(password, confirmPassword);
      setError("Passwords do not match.");
    } else if (password && !validatePasswordComplexity(password)) {
      setError(
        "Password must be at least 8 characters long, include uppercase and lowercase letters, numbers, and special characters.",
      );
    } else {
      setError("");
    }
  }, [password, confirmPassword]);

  return (
    <>
      <form className="mt-2 h-3/4 w-full max-w-2xl">
        <div className="-mx-3 mb-6 flex flex-wrap">
          <div className="w-full px-3 pt-2">
            <div className="mb-2">
              <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                Confirm password
              </label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                placeholder="••••••••"
                className="block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <p className="text-s italic text-dark-text-400">
              This password will be used to decrypt your page, remember it
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateForm;
