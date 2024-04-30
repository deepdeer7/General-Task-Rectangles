interface RectangleInterface {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

type RectangleId = number;

interface EventRectangleInterface extends RectangleInterface {
    id: RectangleId;
}

interface EventInterface {
    x: number;
    rectangle: EventRectangleInterface;
    isStart?: boolean;
}

export function isRectanglesFullyCoverTarget(target: RectangleInterface, rectangles: RectangleInterface[]): boolean {
    const events: EventInterface[] = [];

    if (!target) throw new Error('Please provide a target');
    if (!rectangles.length) return false;

    let id = 1;

    for (const rectangle of rectangles) {
        if (isRectangleOutsideTarget(rectangle, target)) continue;

        const rectangleIntersectionWithTarget = retrieveRectangleIntersectionWithTarget(rectangle, target, id++);
        if (isRectangleFullyCoverTarget(rectangleIntersectionWithTarget, target)) return true;

        events.push({x: rectangleIntersectionWithTarget.x1, rectangle: rectangleIntersectionWithTarget, isStart: true }, { x: rectangleIntersectionWithTarget.x2, rectangle: rectangleIntersectionWithTarget, isStart: false });
    }

    events.sort(({x: event1X}, {x: event2X}) => event1X - event2X);

    const activeRectanglesMap: Map<RectangleId, EventRectangleInterface> = new Map();

    for (let index = 0; index < events.length; index++) {
        const event = events[index];

        const firstEventDoesntCoverTargetX1 = index === 0 && event.x !== target.x1;
        if (firstEventDoesntCoverTargetX1) return false;

        if (index === events.length - 1) {
            const lastEventCoverTargetX2 = event.x === target.x2;
            return lastEventCoverTargetX2;
        }

        if (event.isStart) {
            activeRectanglesMap.set(event.rectangle.id, event.rectangle);
        } else {
            activeRectanglesMap.delete(event.rectangle.id);
        }

        const isNextXCoordinateSame = event.x === events[index + 1]?.x;

        if (isNextXCoordinateSame) continue;

        if (!isTargetCoveredByYCoordinate(target, activeRectanglesMap)) {
            return false;
        }
    }


    return true;
}

function isRectangleOutsideTarget(target: RectangleInterface, rectangle: RectangleInterface): boolean {
    return  rectangle.x1 > target.x2 || rectangle.x2 < target.x1 || rectangle.y1 > target.y2 || rectangle.y2 < target.y1;
}

function isRectangleFullyCoverTarget(rectangle: RectangleInterface, target: RectangleInterface): boolean {
    return rectangle.x1 === target.x1 && rectangle.x2 === target.x2 && rectangle.y1 === target.y1 && rectangle.y2 === target.y2;
}

function retrieveRectangleIntersectionWithTarget(target: RectangleInterface, rectangle: RectangleInterface, id: number): EventRectangleInterface {
    return {
        x1: Math.max(rectangle.x1, target.x1),
        x2: Math.min(rectangle.x2, target.x2),
        y1: Math.max(rectangle.y1, target.y1),
        y2: Math.min(rectangle.y2, target.y2),
        id,
    }
}


function isTargetCoveredByYCoordinate({y1: targetY1, y2: targetY2}: RectangleInterface, rectanglesMap: Map<RectangleId, EventRectangleInterface>): boolean {
    //TODO: optimize
    const rectanglesSortedByY = Array.from(rectanglesMap).map((value) => value[1]).sort((rectangle1, rectangle2) => rectangle1.y1 - rectangle2.y1);

    let y = targetY1;

    for (const rectangle of rectanglesSortedByY) {
        if (y < rectangle.y1) return false;
        y = Math.max(y, rectangle.y2);

        if (y === targetY2) return true;
    }

    return false;
}

// TESTS
const TARGET: RectangleInterface = { x1: 0, y1: 0, x2: 5, y2: 3 };


// 1. Rectangles equal target: should return true
const RECTANGLES_1: RectangleInterface[] = [{...TARGET}];
console.log(`should be true: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_1)}`);

// 2. Rectangles fully cover: should return true
const RECTANGLES_2: RectangleInterface[] = [
    { x1: -1, y1: 0, x2: 2.5, y2: 3 },
    { x1: 2.4, y1: 0, x2: 5, y2: 3 }
];
console.log(`should be true: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_2)}`);

// 3. Rectangles partially cover: should return false
const RECTANGLES_3: RectangleInterface[] = [
    { x1: -1, y1: 0, x2: 2.5, y2: 3 },
    { x1: 3, y1: 0, x2: 5, y2: 3 }
];
console.log(`should be false: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_3)}`);

// 4. Rectangles partially cover: should return false
const RECTANGLES_4: RectangleInterface[] = [
    { x1: -1, y1: 0, x2: 2.5, y2: 3 },
    { x1: 2.2, y1: 0, x2: 4.7, y2: 3 }
];
console.log(`should be false: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_4)}`);


// 5. Rectangles partially cover: should return false
const RECTANGLES_5: RectangleInterface[] = [
    { x1: 0.4, y1: 0, x2: 2.5, y2: 3 },
    { x1: 2.2, y1: 0, x2: 5, y2: 3 }
];
console.log(`should be false: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_5)}`);

// 6. Rectangles partially cover: should return false
const RECTANGLES_6: RectangleInterface[] = [
    { x1: -1, y1: 0, x2: 2.5, y2: 3 },
    { x1: 2.2, y1: 0, x2: 5, y2: 2.7 }
];
console.log(`should be false: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_6)}`);

// 7. Rectangles fully cover: should return true
const RECTANGLES_7: RectangleInterface[] = [
    { x1: -1, y1: 0, x2: 2.5, y2: 3 },
    { x1: 2.2, y1: 0, x2: 5, y2: 3.3 }
];
console.log(`should be true: ${isRectanglesFullyCoverTarget(TARGET, RECTANGLES_7)}`);


