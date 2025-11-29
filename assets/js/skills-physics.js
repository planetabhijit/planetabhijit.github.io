// Wrap in IIFE to avoid global namespace pollution
(function () {
    console.log("Skills Physics script loaded");

    function initPhysics() {
        console.log("Initializing Physics Engine...");
        var container = document.getElementById('skills-physics-container');
        var loading = document.getElementById('skills-loading');

        if (!container) {
            console.error("Skills container not found!");
            return;
        }

        if (typeof Matter === 'undefined') {
            console.error("Matter.js not loaded!");
            if (loading) loading.textContent = "Error: Physics Engine failed to load.";
            return;
        }

        // Module aliases
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Events = Matter.Events;

        // Create engine
        var engine = Engine.create();
        engine.world.gravity.y = 1; // Normal gravity

        // Create renderer
        var render = Render.create({
            element: container,
            engine: engine,
            options: {
                width: container.clientWidth,
                height: container.clientHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        // Skills data
        var skills = [
            { name: 'Java', color: '#e76f00', image: 'images/java.jpg' },
            { name: 'Python', color: '#3776ab', image: 'images/python.jpg' },
            { name: 'C++', color: '#00599c' }, // No image found
            { name: 'HTML5', color: '#e34f26', image: 'images/html.jpg' },
            { name: 'CSS3', color: '#1572b6', image: 'images/css.jpg' },
            { name: 'JavaScript', color: '#f7df1e', textColor: '#000', image: 'images/javascript.png' },
            { name: 'React', color: '#61dafb', textColor: '#000' }, // No image found
            { name: 'Node.js', color: '#339933' }, // No image found
            { name: 'SQL', color: '#003b57', image: 'images/sql.jpg' },
            { name: 'Git', color: '#f05032' }, // No image found
            { name: 'AWS', color: '#232f3e', image: 'images/aws.jpg' },
            { name: 'Docker', color: '#2496ed' }, // No image found
            { name: 'Spring Boot', color: '#6db33f', image: 'images/springboot.png' },
            { name: 'Hibernate', color: '#59666c' }, // No image found
            { name: 'Microservices', color: '#000000' }, // No image found
            { name: 'MongoDB', color: '#47A248', image: 'images/mongodb.png' },
            { name: 'Terraform', color: '#623CE4', image: 'images/terraform.png' }
        ];

        var bodies = [];
        var wallThickness = 60;
        var width = container.clientWidth;
        var height = container.clientHeight;

        // Create walls
        var ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true, render: { visible: false } });
        var leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, render: { visible: false } });
        var rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, render: { visible: false } });

        Composite.add(engine.world, [ground, leftWall, rightWall]);

        // Helper to create fallback body
        function createFallbackBody(skill, x, y, radius) {
            var body = Bodies.circle(x, y, radius, {
                restitution: 0.9,
                friction: 0.005,
                render: {
                    fillStyle: skill.color,
                    strokeStyle: '#ffffff',
                    lineWidth: 2
                }
            });
            body.skillName = skill.name;
            body.textColor = skill.textColor || '#ffffff';
            Composite.add(engine.world, body);
            bodies.push(body);
        }

        // Create skill balls
        skills.forEach(function (skill) {
            var radius = 40 + Math.random() * 20; // Random size
            var x = Math.random() * (width - 100) + 50;
            var y = Math.random() * -500 - 50; // Start above the screen

            if (skill.image) {
                var img = new Image();
                img.src = skill.image;

                img.onload = function () {
                    var scaleX = (radius * 2) / img.naturalWidth;
                    var scaleY = (radius * 2) / img.naturalHeight;

                    var body = Bodies.circle(x, y, radius, {
                        restitution: 0.9,
                        friction: 0.005,
                        render: {
                            sprite: {
                                texture: skill.image,
                                xScale: scaleX,
                                yScale: scaleY
                            }
                        }
                    });
                    Composite.add(engine.world, body);
                    bodies.push(body);
                };

                img.onerror = function () {
                    console.error("Failed to load image: " + skill.image);
                    createFallbackBody(skill, x, y, radius);
                };
            } else {
                createFallbackBody(skill, x, y, radius);
            }
        });

        // Add mouse control
        var mouse = Mouse.create(render.canvas);
        var mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        Composite.add(engine.world, mouseConstraint);

        // Keep the mouse in sync with rendering
        render.mouse = mouse;

        // Run the engine
        Render.run(render);
        var runner = Runner.create();
        Runner.run(runner, engine);

        console.log("Physics Engine started");

        // Hide loading text
        if (loading) loading.style.display = 'none';

        // Custom rendering for text
        Events.on(render, 'afterRender', function () {
            var context = render.context;
            context.font = 'bold 14px "Poppins", sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            bodies.forEach(function (body) {
                // Only render text if skillName is defined (i.e., no image)
                if (body.skillName) {
                    var pos = body.position;
                    context.fillStyle = body.textColor;
                    context.fillText(body.skillName, pos.x, pos.y);
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', function () {
            render.canvas.width = container.clientWidth;
            render.canvas.height = container.clientHeight;
            // Reposition walls... (simplified for now, just reload or let them fall)
        });

        // Zero Gravity Toggle
        var gravitySwitch = document.getElementById('gravity-switch');
        if (gravitySwitch) {
            gravitySwitch.addEventListener('change', function () {
                if (this.checked) {
                    engine.world.gravity.y = 0;
                    engine.world.gravity.scale = 0;

                    // Add some random velocity to float around
                    bodies.forEach(function (body) {
                        Matter.Body.setVelocity(body, {
                            x: (Math.random() - 0.5) * 5,
                            y: (Math.random() - 0.5) * 5
                        });
                    });
                } else {
                    engine.world.gravity.y = 1;
                    engine.world.gravity.scale = 0.001;
                }
            });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initPhysics();
    } else {
        document.addEventListener('DOMContentLoaded', initPhysics);
    }
})();
