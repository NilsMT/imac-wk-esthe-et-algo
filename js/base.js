document.addEventListener("DOMContentLoaded", function () {
    const buttonContainers = document.querySelectorAll(".button-container");

    buttonContainers.forEach((container) => {
        const button = container.querySelector("a");
        const tooltip = container.querySelector(".tooltip");

        if (!button || !tooltip) return;

        button.addEventListener("mouseenter", function () {
            tooltip.classList.add("visible");
            positionTooltip(button, tooltip);
        });

        button.addEventListener("mouseleave", function () {
            tooltip.classList.remove("visible");
        });

        button.addEventListener("mousemove", function () {
            positionTooltip(button, tooltip);
        });
    });
});

function positionTooltip(button, tooltip) {
    const rect = button.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;

    // Position to the right of the button
    let left = rect.right + 10;
    let top = rect.top + (rect.height - tooltipHeight) / 2;

    // Adjust if tooltip goes off-screen to the right
    if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - 10;
    }

    // Adjust if tooltip goes off-screen vertically
    if (top < 0) {
        top = 0;
    } else if (top + tooltipHeight > window.innerHeight) {
        top = window.innerHeight - tooltipHeight;
    }

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
}
