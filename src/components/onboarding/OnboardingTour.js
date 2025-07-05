"use client";

import { useEffect, useRef } from "react";
import Shepherd from "shepherd.js";
import { useAuth } from "@/components/auth/AuthContext";

const OnboardingTour = () => {
  const tourRef = useRef(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't start tour if still loading auth state
    if (loading) return;

    // Check if user has already completed the onboarding
    const isCompleted = localStorage.getItem("cardinet_onboarding_completed");
    if (isCompleted === "true") {
      return;
    }

    // Initialize Shepherd tour
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      classPrefix: "cardinet-shepherd",
      defaultStepOptions: {
        classes: "cardinet-tour-step",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: {
          enabled: false // Disable X button to force Skip/Done usage
        },
        when: {
          show() {
            console.log("Showing step:", this.id);
          },
          hide() {
            console.log("Hiding step:", this.id);
          }
        }
      }
    });

    // Define onboarding steps
    const baseSteps = [
      {
        title: "Welcome to CardiNet!",
        text: "Let's take a quick tour of your new Mapuan social network. This will only take a minute.",
        buttons: [
          {
            text: "Skip Tour",
            classes: "shepherd-button-secondary",
            action() {
              localStorage.setItem("cardinet_onboarding_completed", "true");
              return this.complete();
            }
          },
          {
            text: "Start Tour",
            classes: "shepherd-button-primary",
            action() {
              return this.next();
            }
          }
        ],
        id: "welcome"
      },
      {
        title: "Your Mapuan Community",
        text: "CardiNet connects Mapua students and faculty in one unified platform. Learn, discover, and create together.",
        attachTo: {
          element: '[data-tour="logo"]',
          on: "bottom"
        },
        buttons: [
          {
            text: "Skip",
            classes: "shepherd-button-secondary",
            action() {
              localStorage.setItem("cardinet_onboarding_completed", "true");
              return this.complete();
            }
          },
          {
            text: "Next",
            classes: "shepherd-button-primary",
            action() {
              return this.next();
            }
          }
        ],
        id: "platform-overview"
      },
      {
        title: "Discover Content",
        text: "Use the search bar to find groups, posts, and fellow Mapuans. Connect with people who share your interests.",
        attachTo: {
          element: '[data-tour="search"]',
          on: "bottom"
        },
        buttons: [
          {
            text: "Skip",
            classes: "shepherd-button-secondary",
            action() {
              localStorage.setItem("cardinet_onboarding_completed", "true");
              return this.complete();
            }
          },
          {
            text: "Next",
            classes: "shepherd-button-primary",
            action() {
              return this.next();
            }
          }
        ],
        id: "search-functionality"
      },
      {
        title: "Navigate Your Feed",
        text: "Explore different sections: your home feed, popular posts, trending content, and activities from friends.",
        attachTo: {
          element: '[data-tour="sidebar"]',
          on: "right"
        },
        buttons: [
          {
            text: "Skip",
            classes: "shepherd-button-secondary",
            action() {
              localStorage.setItem("cardinet_onboarding_completed", "true");
              return this.complete();
            }
          },
          {
            text: "Next",
            classes: "shepherd-button-primary",
            action() {
              return this.next();
            }
          }
        ],
        id: "navigation"
      }
    ];

    // Add auth step only if user is not authenticated
    const authStep = {
      title: "Join the Community",
      text: "Ready to get started? Sign up with your Mapua email address or log in if you already have an account.",
      attachTo: {
        element: '[data-tour="auth-buttons"]',
        on: "bottom"
      },
      buttons: [
        {
          text: "Skip",
          classes: "shepherd-button-secondary",
          action() {
            localStorage.setItem("cardinet_onboarding_completed", "true");
            return this.complete();
          }
        },
        {
          text: "Next",
          classes: "shepherd-button-primary",
          action() {
            return this.next();
          }
        }
      ],
      id: "authentication"
    };

    const finalStep = {
      title: "Start Your Journey",
      text: user 
        ? "You're all set! Create posts, join groups, make friends, and become part of the Mapuan community. Welcome aboard!"
        : "You're all set! Create posts, join groups, make friends, and become part of the Mapuan community. Sign up or log in to get started!",
      attachTo: {
        element: '[data-tour="main-content"]',
        on: "top"
      },
      buttons: [
        {
          text: "Finish Tour",
          classes: "shepherd-button-primary",
          action() {
            localStorage.setItem("cardinet_onboarding_completed", "true");
            return this.complete();
          }
        }
      ],
      id: "getting-started"
    };

    // Build steps array based on user authentication status
    const steps = [...baseSteps];
    if (!user) {
      steps.push(authStep);
    }
    steps.push(finalStep);

    // Add steps to tour
    steps.forEach(step => tour.addStep(step));

    // Store tour reference
    tourRef.current = tour;

    // Start the tour after a brief delay to ensure DOM is ready
    const startTour = () => {
      // Check if all required elements exist
      const requiredElements = [
        '[data-tour="logo"]',
        '[data-tour="search"]',
        '[data-tour="sidebar"]',
        '[data-tour="main-content"]'
      ];

      // Add auth buttons to required elements only if user is not authenticated
      if (!user) {
        requiredElements.push('[data-tour="auth-buttons"]');
      }

      const allElementsExist = requiredElements.every(selector => {
        const element = document.querySelector(selector);
        return element !== null;
      });

      if (allElementsExist) {
        tour.start();
      } else {
        // Retry after a short delay if elements aren't ready
        setTimeout(startTour, 500);
      }
    };

    const timer = setTimeout(startTour, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (tourRef.current) {
        tourRef.current.complete();
      }
    };
  }, [user, loading]);

  return null; // This component doesn't render anything
};

export default OnboardingTour;