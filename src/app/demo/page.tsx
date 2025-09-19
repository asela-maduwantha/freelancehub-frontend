'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import CardHeader from '@/components/ui/Card/CardHeader';
import CardBody from '@/components/ui/Card/CardBody';
import CardFooter from '@/components/ui/Card/CardFooter';
import Input from '@/components/ui/Input/Input';
import PasswordInput from '@/components/ui/Input/PasswordInput';
import SearchBar from '@/components/ui/Input/SearchInput';
import TextArea from '@/components/ui/Input/TextArea';
import Badge from '@/components/ui/Display/Badge';
import Alert from '@/components/ui/Feedback/Alert';
import Spinner from '@/components/ui/Feedback/Spinner';
import Loader from '@/components/ui/Feedback/Loader';
import Modal from '@/components/ui/Modal/Modal';
import ConfirmModal from '@/components/ui/Modal/ConfirmModal';
import HeroIllustration from '@/components/ui/Media/Image';
import Image from 'next/image';

export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [alertVisible, setAlertVisible] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    button1: false,
    button2: false,
    button3: false
  });

  const handleLoadingDemo = (buttonKey: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonKey]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonKey]: false }));
    }, 2000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            UI Components Demo
          </h1>
          <p className="text-lg text-secondary mb-8">
            Explore all the reusable components available in FreelanceHub
          </p>
          
          {/* Table of Contents */}
          <Card className="p-6 max-w-4xl mx-auto card-default">
            <h2 className="text-xl font-semibold text-heading mb-4">Quick Navigation</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('buttons')}
                className="text-left justify-start"
              >
                📝 Buttons
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('cards')}
                className="text-left justify-start"
              >
                🎴 Cards
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('forms')}
                className="text-left justify-start"
              >
                📝 Form Inputs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('badges')}
                className="text-left justify-start"
              >
                🏷️ Badges
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('alerts')}
                className="text-left justify-start"
              >
                ⚠️ Alerts
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('loading')}
                className="text-left justify-start"
              >
                ⏳ Loading States
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('modals')}
                className="text-left justify-start"
              >
                🪟 Modals
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('images')}
                className="text-left justify-start"
              >
                🖼️ Images
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => scrollToSection('interactive')}
                className="text-left justify-start"
              >
                🎮 Interactive Examples
              </Button>
            </div>
          </Card>
        </div>

        {/* Components Grid */}
        <div className="space-y-12">
          
          {/* Buttons Section */}
          <section id="buttons">
            <h2 className="text-2xl font-semibold text-heading mb-6">Buttons</h2>
            <Card className="p-6 card-default">
              <div className="space-y-6">
                {/* Button Variants */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary" onClick={() => alert('Primary clicked!')}>
                      Primary Button
                    </Button>
                    <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
                      Secondary Button
                    </Button>
                    <Button variant="accent" onClick={() => alert('Accent clicked!')}>
                      Accent Button
                    </Button>
                    <Button variant="outline" onClick={() => alert('Outline clicked!')}>
                      Outline Button
                    </Button>
                  </div>
                </div>
                
                {/* Button Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                
                {/* Button States */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">States & Loading</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button>Normal</Button>
                    <Button disabled>Disabled</Button>
                    <Button 
                      onClick={() => handleLoadingDemo('button1')}
                      disabled={loadingStates.button1}
                    >
                      {loadingStates.button1 ? (
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" />
                          Loading...
                        </div>
                      ) : (
                        'Click to Load'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards Section */}
          <section id="cards">
            <h2 className="text-2xl font-semibold text-heading mb-6">Cards</h2>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Dark Mode Support:</strong> All card variants now automatically adapt to dark mode with optimized shadows, borders, and colors.
                Switch your system to dark mode to see the enhanced dark theme styling.
              </p>
            </div>
            <div className="space-y-8">
              {/* Card Variants */}
              <div>
                <h3 className="text-lg font-medium text-heading mb-4">Card Variants</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Default Card */}
                  <Card variant="default">
                    <CardHeader>
                      <h4 className="font-medium">Default Card</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm">Standard card with subtle shadow and hover effects.</p>
                    </CardBody>
                  </Card>
                  
                  {/* Elevated Card */}
                  <Card variant="elevated">
                    <CardHeader>
                      <h4 className="font-medium">Elevated Card</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm">More prominent with stronger shadow and lift effect.</p>
                    </CardBody>
                  </Card>
                  
                  {/* Flat Card */}
                  <Card variant="flat">
                    <CardHeader>
                      <h4 className="font-medium">Flat Card</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm">Minimal styling with just a border, no shadow.</p>
                    </CardBody>
                  </Card>
                  
                  {/* Interactive Card */}
                  <Card variant="interactive" onClick={() => alert('Interactive card clicked!')}>
                    <CardHeader>
                      <h4 className="font-medium">Interactive Card</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm">Click me! Enhanced hover effects for interactive elements.</p>
                    </CardBody>
                  </Card>
                </div>
              </div>

              {/* Compact Cards */}
              <div>
                <h3 className="text-lg font-medium text-heading mb-4">Compact Cards</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="card-compact">
                    <CardHeader>
                      <h4 className="font-medium text-sm">Compact Header</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-xs">Smaller padding for tight layouts and mobile views.</p>
                    </CardBody>
                    <CardFooter>
                      <Button size="sm">Action</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="card-compact">
                    <CardHeader>
                      <h4 className="font-medium text-sm">Minimal Card</h4>
                    </CardHeader>
                    <CardBody>
                      <p className="text-xs">Perfect for dashboards and data-dense interfaces.</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="card-compact">
                    <CardBody>
                      <p className="text-xs">Body-only compact card for simple content.</p>
                    </CardBody>
                  </Card>
                </div>
              </div>

              {/* Original Card Examples */}
              <div>
                <h3 className="text-lg font-medium text-heading mb-4">Usage Examples</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Card */}
                  <Card className="p-6 card-default">
                    <h3 className="text-lg font-medium text-heading mb-2">Basic Card</h3>
                    <p className="text-secondary">This is a simple card component with basic styling.</p>
                  </Card>
                  
                  {/* Card with Header, Body, Footer */}
                  <Card className="card-default">
                    <CardHeader>
                      <h3 className="text-lg font-medium text-heading">Structured Card</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-secondary">
                        This card uses CardHeader, CardBody, and CardFooter components
                        for better content organization.
                      </p>
                    </CardBody>
                    <CardFooter>
                      <Button size="sm">Action</Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Interactive Card */}
                  <Card onClick={() => alert('Card clicked!')} className="p-6 card-default">
                    <h3 className="text-lg font-medium text-heading mb-2">Interactive Card</h3>
                    <p className="text-secondary">Click me! This card has an onClick handler.</p>
                  </Card>
                  
                  {/* Card with Badge */}
                  <Card className="p-6 card-default">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-heading">Card with Badge</h3>
                      <Badge variant="success" size="sm">New</Badge>
                    </div>
                    <p className="text-secondary">This card demonstrates combining components.</p>
                  </Card>
                  
                  {/* Card with Loading State */}
                  <Card className="p-6 card-default">
                    <h3 className="text-lg font-medium text-heading mb-3">Loading Card</h3>
                    <div className="space-y-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleLoadingDemo('button2')}
                        disabled={loadingStates.button2}
                        className="w-full"
                      >
                        {loadingStates.button2 ? (
                          <div className="flex items-center justify-center gap-2">
                            <Spinner size="sm" />
                            Processing...
                          </div>
                        ) : (
                          'Start Process'
                        )}
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Card with Form */}
                  <Card className="p-6 card-default">
                    <h3 className="text-lg font-medium text-heading mb-3">Quick Form</h3>
                    <div className="space-y-3">
                      <Input placeholder="Enter your name" />
                      <Button size="sm" className="w-full">Submit</Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Form Inputs Section */}
          <section id="forms">
            <h2 className="text-2xl font-semibold text-heading mb-6">Form Inputs</h2>
            <Card className="p-6 card-default">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-body mb-2">
                      Text Input
                    </label>
                    <Input
                      placeholder="Enter some text..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    {inputValue && (
                      <p className="text-xs text-gray-500 mt-1">
                        You typed: {inputValue}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-body mb-2">
                      Password Input
                    </label>
                    <PasswordInput
                      placeholder="Enter password..."
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-body mb-2">
                      Search Input
                    </label>
                    <SearchBar />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-body mb-2">
                      Text Area
                    </label>
                    <TextArea
                      placeholder="Enter a longer message..."
                      value={textAreaValue}
                      onChange={(e) => setTextAreaValue(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Disabled State */}
              <div className="mt-6 pt-6 border-t border-secondary">
                <h3 className="text-lg font-medium text-heading mb-4">Disabled State</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Disabled input" disabled />
                  <TextArea placeholder="Disabled textarea" disabled rows={2} />
                </div>
              </div>
            </Card>
          </section>

          {/* Badges Section */}
          <section id="badges">
            <h2 className="text-2xl font-semibold text-heading mb-6">Badges</h2>
            <Card className="p-6 card-default">
              <div className="space-y-6">
                {/* Badge Variants */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                  </div>
                </div>
                
                {/* Badge Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Alerts Section */}
          <section id="alerts">
            <h2 className="text-2xl font-semibold text-heading mb-6">Alerts</h2>
            <div className="space-y-4">
              <Alert
                type="success"
                title="Success!"
                message="Your action was completed successfully."
              />
              <Alert
                type="error"
                title="Error"
                message="Something went wrong. Please try again."
              />
              <Alert
                type="warning"
                title="Warning"
                message="Please review your input before proceeding."
              />
              <Alert
                type="info"
                message="Here's some helpful information for you."
              />
            </div>
          </section>

          {/* Loading States Section */}
          <section id="loading">
            <h2 className="text-2xl font-semibold text-heading mb-6">Loading States</h2>
            <Card className="p-6 card-default">
              <div className="space-y-6">
                {/* Spinners */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Spinners</h3>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Spinner size="sm" />
                      <p className="text-sm text-secondary mt-2">Small</p>
                    </div>
                    <div className="text-center">
                      <Spinner size="md" />
                      <p className="text-sm text-secondary mt-2">Medium</p>
                    </div>
                    <div className="text-center">
                      <Spinner size="lg" />
                      <p className="text-sm text-secondary mt-2">Large</p>
                    </div>
                  </div>
                </div>
                
                {/* Loader Component */}
                <div>
                  <h3 className="text-lg font-medium text-heading mb-4">Loader Component</h3>
                  <div className="border rounded-lg p-8 bg-page">
                    <Loader />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Modals Section */}
          <section id="modals">
            <h2 className="text-2xl font-semibold text-heading mb-6">Modals</h2>
            <Card className="p-6 card-default">
              <div className="flex gap-4">
                <Button onClick={() => setShowModal(true)}>
                  Open Modal
                </Button>
                <Button
                  variant="accent"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Open Confirm Modal
                </Button>
              </div>
            </Card>
          </section>

          {/* Images Section */}
          <section id="images">
            <h2 className="text-2xl font-semibold text-heading mb-6">Images</h2>
            <Card className="p-6 card-default">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-[200px] h-[150px] mx-auto">
                    <HeroIllustration />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Hero Illustration Component</p>
                </div>
                
                <div className="text-center">
                  <Image
                    src="/public/next.svg"
                    alt="Avatar Placeholder"
                    width={100}
                    height={100}
                    className="rounded-full mx-auto bg-secondary"
                  />
                  <p className="text-sm text-secondary mt-2">Circular Image</p>
                </div>
                
                <div className="text-center">
                  <Image
                    src="/next.svg"
                    alt="Next.js Logo"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                  <p className="text-sm text-secondary mt-2">Icon Example</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Interactive Examples Section */}
          <section id="interactive">
            <h2 className="text-2xl font-semibold text-heading mb-6">Interactive Examples</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Alert Management */}
              <Card className="p-6 card-default">
                <h3 className="text-lg font-medium text-heading mb-4">Alert Management</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setAlertVisible(true)}>
                      Show Alert
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setAlertVisible(false)}>
                      Hide Alert
                    </Button>
                  </div>
                  {alertVisible && (
                    <Alert
                      type="info"
                      title="Interactive Alert"
                      message="This alert can be shown/hidden with the buttons above!"
                      onClose={() => setAlertVisible(false)}
                    />
                  )}
                </div>
              </Card>

              {/* Component Combinations */}
              <Card className="p-6 card-default">
                <h3 className="text-lg font-medium text-heading mb-4">Component Combinations</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary">Status</Badge>
                    <Spinner size="sm" />
                    <span className="text-sm text-secondary">Processing...</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Complete</Badge>
                    <Button size="sm" onClick={() => alert('Action completed!')}>
                      View Details
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-page rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Task Progress</span>
                      <Badge variant="warning" size="sm">In Progress</Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form Example */}
              <Card className="p-6 lg:col-span-2 card-default">
                <h3 className="text-lg font-medium text-heading mb-4">Complete Form Example</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-body mb-2">
                        Full Name
                      </label>
                      <Input placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-body mb-2">
                        Email
                      </label>
                      <Input type="email" placeholder="Enter your email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-body mb-2">
                        Password
                      </label>
                      <PasswordInput placeholder="Create a password" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-body mb-2">
                        User Type
                      </label>
                      <div className="flex gap-2">
                        <Badge variant="outline">Freelancer</Badge>
                        <Badge variant="outline">Client</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-body mb-2">
                        Bio
                      </label>
                      <TextArea 
                        placeholder="Tell us about yourself..." 
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-secondary">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleLoadingDemo('button3')}
                      disabled={loadingStates.button3}
                      className="flex-1"
                    >
                      {loadingStates.button3 ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size="sm" />
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <Button variant="secondary">Cancel</Button>
                  </div>
                </div>
              </Card>
              
            </div>
          </section>

        </div>
      </div>

      {/* Modal Examples */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Example Modal"
        size="md"
      >
        <div className="p-4">
          <p className="text-secondary mb-4">
            This is an example modal component. You can put any content here.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          alert('Confirmed!');
          setShowConfirmModal(false);
        }}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This cannot be undone."
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />
    </div>
  );
}
