import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Alert from './ui/Alert';
import FormInput from './forms/FormInput';
import FormSelect from './forms/FormSelect';
import FormTextarea from './forms/FormTextarea';
import FormCheckbox from './forms/FormCheckbox';

const Forms = () => {
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    address: '',
    bio: '',
    terms: false,
    newsletter: false,
  });
  
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error on change
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name
    if (!formValues.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formValues.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formValues.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Validate password
    if (!formValues.password) {
      newErrors.password = 'Password is required';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate country
    if (!formValues.country) {
      newErrors.country = 'Please select a country';
    }
    
    // Validate terms
    if (!formValues.terms) {
      newErrors.terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, perform submission
      console.log('Form submitted:', formValues);
      setSubmitSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }
  };
  
  const handleReset = () => {
    setFormValues({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      address: '',
      bio: '',
      terms: false,
      newsletter: false,
    });
    setErrors({});
    setSubmitSuccess(false);
  };
  
  // Sample country options
  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'jp', label: 'Japan' },
  ];
  
  // Sample state options
  const stateOptions = [
    { value: 'ny', label: 'New York' },
    { value: 'ca', label: 'California' },
    { value: 'tx', label: 'Texas' },
    { value: 'fl', label: 'Florida' },
    { value: 'il', label: 'Illinois' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Form Elements</h1>
      </div>
      
      {submitSuccess && (
        <Alert
          variant="success"
          title="Form Submitted Successfully!"
          message="Your form has been submitted successfully."
          dismissible
          onDismiss={() => setSubmitSuccess(false)}
        />
      )}
      
      {/* Basic Form */}
      <Card title="Registration Form" collapsible>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formValues.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              icon="fas fa-user"
              required
              error={errors.firstName}
            />
            
            <FormInput
              label="Last Name"
              name="lastName"
              value={formValues.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              icon="fas fa-user"
              required
              error={errors.lastName}
            />
            
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="Enter email"
              icon="fas fa-envelope"
              required
              error={errors.email}
              helpText="We'll never share your email with anyone else."
              fullWidth
            />
            
            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              icon="fas fa-phone"
              helpText="Optional"
            />
            
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Enter password"
              icon="fas fa-lock"
              required
              error={errors.password}
              helpText="Must be at least 6 characters"
            />
            
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              icon="fas fa-lock"
              required
              error={errors.confirmPassword}
            />
          </div>
          
          <hr className="my-6" />
          
          <h3 className="text-lg font-medium mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Country"
              name="country"
              value={formValues.country}
              onChange={handleChange}
              options={countryOptions}
              placeholder="Select Country"
              required
              error={errors.country}
            />
            
            <FormSelect
              label="State/Province"
              name="state"
              value={formValues.state}
              onChange={handleChange}
              options={stateOptions}
              placeholder="Select State"
            />
            
            <FormInput
              label="City"
              name="city"
              value={formValues.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
            
            <FormInput
              label="Zip/Postal Code"
              name="zipCode"
              value={formValues.zipCode}
              onChange={handleChange}
              placeholder="Enter zip code"
            />
            
            <FormTextarea
              label="Address"
              name="address"
              value={formValues.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              rows={3}
              fullWidth
            />
          </div>
          
          <hr className="my-6" />
          
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <FormTextarea
            label="Bio"
            name="bio"
            value={formValues.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself"
            rows={4}
            helpText="Optional - Maximum 500 characters"
          />
          
          <div className="mt-4">
            <FormCheckbox
              label="I agree to the terms and conditions"
              name="terms"
              checked={formValues.terms}
              onChange={handleChange}
              error={errors.terms}
            />
            
            <FormCheckbox
              label="Subscribe to newsletter"
              name="newsletter"
              checked={formValues.newsletter}
              onChange={handleChange}
              helpText="Get updates about our new products and features"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="light" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" variant="primary" icon="fas fa-paper-plane">
              Submit
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Input Types */}
      <Card title="Input Types & Variations" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Text Input"
            placeholder="Regular text input"
          />
          
          <FormInput
            label="Disabled Input"
            placeholder="Disabled input"
            disabled
          />
          
          <FormInput
            label="Email Input"
            type="email"
            placeholder="example@domain.com"
            icon="fas fa-envelope"
          />
          
          <FormInput
            label="Password Input"
            type="password"
            placeholder="Password"
            icon="fas fa-lock"
          />
          
          <FormInput
            label="Number Input"
            type="number"
            placeholder="Enter a number"
            icon="fas fa-hashtag"
          />
          
          <FormInput
            label="Date Input"
            type="date"
            icon="fas fa-calendar"
          />
          
          <FormInput
            label="Time Input"
            type="time"
            icon="fas fa-clock"
          />
          
          <FormInput
            label="Error Input"
            placeholder="This input has an error"
            error="This field is required"
          />
        </div>
        
        <hr className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Basic Select"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
          />
          
          <FormSelect
            label="Disabled Select"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ]}
            disabled
          />
        </div>
        
        <div className="mt-4">
          <FormTextarea
            label="Textarea"
            placeholder="Enter multiple lines of text"
            rows={3}
          />
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Checkboxes</h4>
            <FormCheckbox label="Option 1" name="option1" />
            <FormCheckbox label="Option 2" name="option2" checked />
            <FormCheckbox label="Disabled" name="option3" disabled />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Radio Buttons</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio1"
                  name="radioGroup"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="radio1" className="ml-2 text-gray-700">Option 1</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio2"
                  name="radioGroup"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="radio2" className="ml-2 text-gray-700">Option 2</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio3"
                  name="radioGroup"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <label htmlFor="radio3" className="ml-2 text-gray-400">Disabled</label>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Forms;
