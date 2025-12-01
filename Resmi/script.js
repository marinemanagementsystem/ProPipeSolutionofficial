"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('header nav ul');

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            } else {
                document.body.style.overflow = ''; // Re-enable scrolling
            }
        });
    }

    // Function to close mobile menu
    function closeMobileMenu() {
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    }

    // --- Theme Toggler ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    if (currentTheme) {
        document.body.classList.add(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Optional: Set dark theme based on OS preference if no setting saved
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            let theme = 'light-theme'; // Assume light if dark-theme class is not present
            if (document.body.classList.contains('dark-theme')) {
                theme = 'dark-theme';
            }
            localStorage.setItem('theme', theme); // Save preference
            updateThemeButtonIcon(); // Update icon
        });
    }

    // Function to update button icon based on theme
    function updateThemeButtonIcon() {
        if (themeIcon) { // Check if icon element exists
            if (document.body.classList.contains('dark-theme')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }
     // Initial icon setup
    updateThemeButtonIcon();

    // --- Smooth Scrolling for Nav Links ---
    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // --- Active Nav Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    let headerHeight = 0; // Initialize headerHeight
    const headerElement = document.querySelector('header');

    // Function to calculate header height dynamically
    function calculateHeaderHeight() {
        if (headerElement) {
             headerHeight = headerElement.offsetHeight;
        }
    }

    // Calculate initial header height
    calculateHeaderHeight();

    // Recalculate on window resize (optional, but good practice)
    window.addEventListener('resize', calculateHeaderHeight);

    // Get nav links again for highlighting (ensure it includes the ones inside the ul)
    const highlightNavLinks = document.querySelectorAll('#nav-menu a[href^="#"]');

    function highlightNavLink() {
        let scrollY = window.pageYOffset;
        let currentSectionId = '';

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            // Adjust top calculation slightly based on header height
            const sectionTop = current.offsetTop - headerHeight - 50; // Adjust offset as needed

            if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                 currentSectionId = current.getAttribute('id');
            }
        });

         // Handle edge case for being very close to the top
        if (scrollY < sections[0].offsetTop - headerHeight - 50) {
             currentSectionId = sections[0].getAttribute('id'); // Highlight first link if above first section
        }
         // Handle edge case for bottom of page
        else if (window.innerHeight + scrollY >= document.body.offsetHeight - 50) { // Check if near bottom
             const lastSection = sections[sections.length - 1];
             if (lastSection) {
                  currentSectionId = lastSection.getAttribute('id');
             }
        }


        highlightNavLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current section ID
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink(); // Initial call

    // --- Header Scroll Effect ---
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            headerElement.classList.add('scrolled');
        } else {
            headerElement.classList.remove('scrolled');
        }
    }

    // Initialize header state
    handleHeaderScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleHeaderScroll);

    // --- Scroll to Top Button ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollToTopBtn) { // Check if the button exists
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Equipment Modal Logic ---
    const modal = document.getElementById('techiz-modal');
    const modalBody = document.getElementById('modal-body');
    // Select the close button *inside* the modal only
    const closeModalBtn = modal ? modal.querySelector('.close-modal-btn') : null;
    const hiddenDetailsContainer = document.getElementById('techiz-details');
    const detailButtons = document.querySelectorAll('.open-modal-btn'); // Use a specific class for buttons

    // Function to open the modal
    function openModal(contentId) {
         if (!modal || !modalBody || !hiddenDetailsContainer) return; // Safety check

        const detailContent = hiddenDetailsContainer.querySelector(`#${contentId}-details`);
         if (detailContent) {
            modalBody.innerHTML = ''; // Clear previous content
            // Clone the node to avoid moving it from the hidden container
            modalBody.appendChild(detailContent.cloneNode(true));
            modal.classList.add('show');
             // Optional: Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Detail content not found for ID:', contentId);
        }
    }

    // Function to close the modal - Made globally accessible if needed by inline onclick
    window.closeModal = function() {
        if (!modal) return;
        modal.classList.remove('show');
        // Optional: Delay clearing content to allow fade-out animation
        // setTimeout(() => {
        //     if (modalBody) modalBody.innerHTML = '';
        // }, 300); // Match CSS transition duration

        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Add event listeners to "Detaylar" buttons
    detailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
             e.preventDefault(); // Prevent default anchor behavior if it's a link
            const contentId = button.getAttribute('data-modal-target'); // Use data attribute to link button to content div ID
             if(contentId) {
                openModal(contentId);
             }
        });
    });

    // Event listener for the modal's close button
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', window.closeModal);
    }


    // Event listener to close modal when clicking outside the modal content
    if (modal) {
        modal.addEventListener('click', (event) => {
            // Check if the click is directly on the modal background (the #techiz-modal element)
            if (event.target === modal) {
                window.closeModal();
            }
        });
    }

     // Event listener for pressing the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && modal.classList.contains('show')) {
            window.closeModal();
        }
    });


    // --- Accordion Logic (for Piping Section) ---
    const accordionItems = document.querySelectorAll('.accordion-item'); // Add this class to items

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header'); // Add this class to header
        const content = item.querySelector('.accordion-content'); // Add this class to content
        const icon = header ? header.querySelector('.accordion-icon') : null; // Optional icon element

        if(header && content) {
            header.addEventListener('click', () => {
                const itemIsActive = item.classList.contains('active');

                // Optional: Close other open items
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.accordion-content').style.maxHeight = null;
                         const otherIcon = otherItem.querySelector('.accordion-icon');
                         if(otherIcon) {
                             otherIcon.classList.remove('fa-minus');
                             otherIcon.classList.add('fa-plus');
                         }
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    if(icon) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    }
                } else {
                    content.style.maxHeight = null;
                     if(icon) {
                         icon.classList.remove('fa-minus');
                         icon.classList.add('fa-plus');
                     }
                }
            });
        }
    });

    // --- Animations on Scroll (Example using Intersection Observer) ---
     const animatedElements = document.querySelectorAll('.animate-on-scroll');

     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.classList.add('animated');
                 // Optional: Unobserve after animation to save resources
                 // observer.unobserve(entry.target);
             } else {
                 // Optional: Remove class to re-animate on scroll up
                 // entry.target.classList.remove('animated');
             }
         });
     }, {
         threshold: 0.1 // Trigger when 10% of the element is visible
     });

     animatedElements.forEach(el => observer.observe(el));

    // --- Load Social Media Links ---
    async function loadAndApplySocialLinks() {
        try {
            const response = await fetch(`social_links.json?t=${Date.now()}`); // Prevent caching
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const links = await response.json();

            // Select all social media links in both contact and footer
            const socialIcons = document.querySelectorAll('#iletisim .social-media a, footer .social-media a');

            socialIcons.forEach(iconLink => {
                const label = iconLink.getAttribute('aria-label').toLowerCase(); // e.g., 'linkedin'
                if (links[label] && links[label].trim() !== '') {
                    iconLink.href = links[label];
                    iconLink.style.display = ''; // Make sure it's visible if it was hidden
                } else {
                    iconLink.href = '#'; // Default or no link
                    // Optional: Hide the icon if the link is empty
                    // iconLink.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Error loading or applying social links:', error);
            // Icons will keep their default href="#"
        }
    }

    // Load social links when the page loads
    loadAndApplySocialLinks();

}); // End DOMContentLoaded 