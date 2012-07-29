CGPointInRect = function(point, rect) 
{ 
     return point.x >= rect.origin.x && point.x <= rect.origin.x + rect.size.width && point.y >= rect.origin.y && point.y <= rect.origin.y + rect.size.height; 
} 
@import "GameView.j"

@implementation RTSelectionBox : CPView
{
	float RTHandleHalfWidth;
	float RTHandleHalfHeight;
	CPBox selectionBox;
	
	CGRect resizeHandle;
	
	BOOL isResizing;
	BOOL isMoving;
	BOOL isRotating;
	CGPoint lastPos;
	var selectedObject @accessors;
	int gridSpacing @accessors;
	float rotationHandleLength;
	
	CGRect rotateHandle;

	BOOL isWidthOnly;
	BOOL isHeightOnly;
}

- (id)initWithFrame:(CGRect)aFrame
{
    self = [super initWithFrame:aFrame];
    
    if (self)
    {
		RTHandleHalfWidth = 4;
		RTHandleHalfHeight = 4;
		selectionBox = [[CPBox alloc] init];
		[selectionBox setBorderColor:[CPColor colorWithRed: .3 green: .3 blue: .6 alpha: .35]];
		[selectionBox setBorderWidth: 1.0]; 
		[selectionBox setBorderType: CPLineBorder];
		[selectionBox setFrame: [self bounds]];
		[self addSubview: selectionBox];
		[self setGridSpacing: 10];
		rotationHandleLength = 30;
    }
    return self;
}


-(void) setSelectionBoxFrame: (CGRect)aFrame
{
	// the outer box (i.e. this one) needs to be bigger, so the handles can be seen and clicked
	var r = CGRectInset(aFrame,-RTHandleHalfWidth*2,-RTHandleHalfHeight*2);
	[self setFrame: r];
	[selectionBox setFrame: CGRectOffset(aFrame, -aFrame.origin.x+RTHandleHalfWidth*2, -aFrame.origin.y+RTHandleHalfWidth*2)];
}

- (void)drawHandleInView:(CPView)view atPoint:(CGPoint)p
{
	var px = 1;
//	if (window.useragent.indexOf("iPad")>-1) xp = 2;
	
    // Figure out a rectangle that's centered on the point 
    var handleBounds = CGRectMake(p.x+ RTHandleHalfWidth*px, p.y+ RTHandleHalfHeight*px, RTHandleHalfWidth*2*px, RTHandleHalfHeight*2*px);
    
    // Draw the shadow of the handle
    var handleShadowBounds = CGRectOffset(handleBounds, 1.0, 1.0);
    var context = [[CPGraphicsContext currentContext] graphicsPort];
    CGContextSetFillColor(context, [CPColor shadowColor]);
    CGContextFillRect(context, handleShadowBounds);

    // Draw the handle itself
    CGContextSetFillColor(context, [CPColor blueColor]);
    CGContextFillRect(context, handleBounds);
}

-(void)drawRegistrationPoint: (CGPoint)p
{
    var handleBounds = CGRectMake(p.x-RTHandleHalfWidth, p.y- RTHandleHalfHeight, RTHandleHalfWidth*2, RTHandleHalfHeight*2);
    
    // Draw the shadow of the handle
    var handleShadowBounds = CGRectOffset(handleBounds, 1.0, 1.0);
	
    var context = [[CPGraphicsContext currentContext] graphicsPort];
    CGContextSetFillColor(context, [CPColor shadowColor]);
    CGContextFillEllipseInRect(context, handleShadowBounds);

    //CGContextSetStrokeColorWithColor(context, color);
   // CGContextSetLineWidth(context, .5);

	// line for rotation handle
	CGContextSetStrokeColor(context, [CPColor grayColor]);
	var x1, y1;
	x1 = p.x + rotationHandleLength * Math.cos(Math.PI/180 * (0 - selectedObject.getRotation()));
	y1 = p.y + rotationHandleLength * Math.sin(Math.PI/180 * (0 - selectedObject.getRotation()));
    CGContextMoveToPoint(context, p.x, p.y);
	CGContextAddLineToPoint(context, x1-RTHandleHalfWidth, y1);
	CGContextSetLineWidth(context, .5);
    CGContextStrokePath(context);
	
	// draw the rotation path circle
	// CGContextSetLineDash(context, 2, dottedLine, 2); // NOTE: cappuccino is missing this!
	var r = CGRectMake(p.x-rotationHandleLength, p.y-rotationHandleLength, rotationHandleLength*2, rotationHandleLength*2);
    CGContextStrokeEllipseInRect(context, r);

    // Draw the rotation handle and shadow
	rotateHandle = CGRectMake(x1-RTHandleHalfWidth, y1-RTHandleHalfHeight, RTHandleHalfWidth*2, RTHandleHalfHeight*2);
    var rotateHandleShadow = CGRectOffset(rotateHandle, 1.0, 1.0);
	
    CGContextSetFillColor(context, [CPColor shadowColor]);
    CGContextFillEllipseInRect(context, rotateHandleShadow);
	CGContextSetFillColor(context, [CPColor greenColor]);
    CGContextFillEllipseInRect(context, rotateHandle);

    // Draw the reg point itself
    CGContextSetFillColor(context, [CPColor redColor]);
    CGContextFillEllipseInRect(context, handleBounds);

}
- (void)drawHandlesInView:(CPView)view 
{
    // Draw handles at the corners and on the sides.
    var bounds = [selectionBox bounds];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMinX(bounds), CGRectGetMinY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMidX(bounds), CGRectGetMinY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMaxX(bounds), CGRectGetMinY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMinX(bounds), CGRectGetMidY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMaxX(bounds), CGRectGetMidY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMinX(bounds), CGRectGetMaxY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMidX(bounds), CGRectGetMaxY(bounds))];
    [self drawHandleInView:view atPoint:CGPointMake(CGRectGetMaxX(bounds), CGRectGetMaxY(bounds))];
}


- (void)drawRect:(CGRect) aRect
{
	[super drawRect: aRect];
	[self drawHandlesInView: self];
	if (selectedObject) {
		[self drawRegistrationPoint: CGPointMake(selectedObject.getAnchorPoint().x*aRect.size.width, selectedObject.getAnchorPoint().y*aRect.size.height)];
	}	
}

- (BOOL)isHandleAtPoint:(CGPoint)p underPoint:(CGPoint)atPoint
{
    // Check a handle-sized rectangle that's centered on the handle point.
    var handleBounds = CGRectMake(p.x+ RTHandleHalfWidth, p.y+ RTHandleHalfHeight, RTHandleHalfWidth*2, RTHandleHalfHeight*2);
    return CGPointInRect(atPoint,handleBounds);
}

-(void) mouseDown: (CPEvent) e
{
	[[GameView sharedGameView] hideSelectionBoxes];
	var bounds = [selectionBox bounds];
	//console.log(CPStringFromPoint([self convertPoint:[e locationInWindow] fromView: nil]) + ", " + CPStringFromPoint(CGPointMake(CGRectGetMaxX(bounds), CGRectGetMaxY(bounds))));
	if ([self isHandleAtPoint: CGPointMake(CGRectGetMaxX(bounds), CGRectGetMaxY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]])
	{
		console.log("start resizing");
		isResizing = YES;
		isWidthOnly = NO;
		isHeightOnly = NO;
	} else if ([self isHandleAtPoint: CGPointMake(CGRectGetMaxX(bounds), CGRectGetMidY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]])
	{
		isResizing = YES;
		isWidthOnly = YES;
		isHeightOnly = NO;
	} else if ([self isHandleAtPoint: CGPointMake(CGRectGetMidX(bounds), CGRectGetMaxY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]])
	{
		isResizing = YES;
		isWidthOnly = NO;
		isHeightOnly = YES;
	} else if (CGPointInRect( [self convertPoint:[e locationInWindow] fromView: nil], rotateHandle)) {
		isRotating = YES;
	} else {
		isMoving = YES;
		[self setHidden: YES];		
	}
	lastPos = [self convertPoint:[e locationInWindow] fromView: nil];

	[[self superview] willPerformUndoableAction];
	
/*	saving for later: 
	|| [self isHandleAtPoint: CGPointMake(CGRectGetMaxX(bounds), CGRectGetMinY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]] 
	|| [self isHandleAtPoint: CGPointMake(CGRectGetMinX(bounds), CGRectGetMaxY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]] 
	|| [self isHandleAtPoint: CGPointMake(CGRectGetMinX(bounds), CGRectGetMinY(bounds)) underPoint: [self convertPoint:[e locationInWindow] fromView: nil]]
	*/
}

-(void) groupDragWithX: (int) deltaX andY: (int) deltaY
{
	var oldPos = selectedObject.getPosition();
	var s = renderContext.director.getScale();

	selectedObject.setPosition(oldPos.x+deltaX/s.x, oldPos.y+deltaY/s.y).update();

	var p = [self center];
//	[self setCenter: CGPointMake(p.x+deltaX, p.y+deltaY) ];

	//location.x = location.x+deltaX;
	//location.y = location.y+deltaY;
} 

-(void) groupDragBegin
{
} 

-(void) groupDragEnd
{
} 

-(void) mouseDragged: (CPEvent) e
{
	if (isResizing) {
		var p = [self convertPoint: [e locationInWindow] fromView: nil];
		//console.log(CPStringFromPoint(p));
		if (selectedObject) {
			if ([e modifierFlags] && CPShiftKeyMask) p.x = p.y = Math.max(p.x, p.y);
			if (isWidthOnly) p.y = selectedObject.getSize().height;
			else if (isHeightOnly) p.x = selectedObject.getSize().width;
			selectedObject.setSize(p.x, p.y);
			var b = selectedObject.getBoundingBox();
			var s = renderContext.director.getScale();
			var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
			[self setSelectionBoxFrame: r];
		}
		else console.warn("selectedObject is nil");
	} else if (isMoving) {
		if (selectedObject) {
			var p = [self convertPoint: [e locationInWindow] fromView: nil];
			if (p == lastPos) return;

			// TODO: fix this! It is constrainging the DRAG POINT to a grid, not the resulting object coordinate
			
			if ([e modifierFlags] && CPControlKeyMask) p.x -= (p.x % gridSpacing), p.y -= (p.y % gridSpacing);

			var oldPos = selectedObject.getPosition();
			var s = renderContext.director.getScale();
			var deltaX = (p.x-lastPos.x), deltaY = p.y-lastPos.y;

			selectedObject.setPosition(oldPos.x+deltaX/s.x, oldPos.y+deltaY/s.y).update();
			lastPos = p;

			location.x=location.x+deltaX;
			location.y=location.y+deltaY;
			[[GameView sharedGameView] dragSelectedObjectsWithX: deltaX andY: deltaY sourceObject: self];
		}
	} else if (isRotating) {
		var pos = selectedObject.getPosition();
		var pos = [self convertPoint: pos fromView: nil];
		var p = [self convertPoint: [e locationInWindow] fromView: nil];
		var angle = Math.atan2(pos.x-p.x, pos.y-p.y);
		selectedObject.setRotation(((angle+90)*57.2957795)%360);
		var b = selectedObject.getBoundingBox();
		var s = renderContext.director.getScale();
		var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
		[self setSelectionBoxFrame: r];
		[self setNeedsDisplay: YES];
	}
}

-(void) mouseUp: (CPEvent) e
{
	if (isMoving) {
		var b = selectedObject.getBoundingBox();
		var s = renderContext.director.getScale();
		var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
		[self setSelectionBoxFrame: r];
		[self setHidden: NO];
		isMoving = NO;
	} else if (isResizing) isResizing = NO;
	else if (isRotating) isRotating = NO;
	[[GameView sharedGameView] updateSelectionBoxes];
	
	[[self superview] didPerformUndoableAction];
	
}

-(void) undoMove: (Object) p
{	
	console.log("undoMove:");
	selectedObject.setPosition(p);
	var b = selectedObject.getBoundingBox();
	var s = renderContext.director.getScale();
	var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
	[self setSelectionBoxFrame: r];
}

-(void) acceptsFirstResponder
{
	return YES;
}

-(BOOL) acceptsFirstMouse: (CPEvent) e
{
	return YES;
}

@end
