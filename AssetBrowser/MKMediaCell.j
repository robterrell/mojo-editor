/*
 * MKMediaCell.j
 * MediaKit
 *
 * Created by Ross Boucher.
 * Copyright 2009, 280 North, Inc.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

@import <AppKit/CPView.j>


var MEDIA_PREVIEW_MARGIN        = 4.0,
    MEDIA_THUMBNAIL_MAX_WIDTH   = 96.0,
    MEDIA_THUMBNAIL_MAX_HEIGHT  = 71.0;

@implementation MKMediaCell : CPView
{
    CPImage     _image;
    CPImageView _imageView;

    CPTextField _titleField;
    CPTextField _sourceField;
    CPTextField _metaField;
    CPTextField _descField;

    Object      _object;
}

- (id)initWithFrame:(CGRect)aFrame
{
    self = [super initWithFrame:aFrame];
    
    if (self)
    {
        _imageView = [[CPImageView alloc] initWithFrame:CGRectMake(2.0, 2.0, MEDIA_THUMBNAIL_MAX_WIDTH, MEDIA_THUMBNAIL_MAX_HEIGHT)];
        
        [_imageView setHasShadow:YES];

        [self addSubview:_imageView];

        var bounds = [self bounds],
            width = CGRectGetWidth(bounds),
            fieldWidth = CGRectGetWidth(bounds) - MEDIA_THUMBNAIL_MAX_WIDTH - 2 * MEDIA_PREVIEW_MARGIN;
        
        _titleField = [[CPTextField alloc] initWithFrame:CGRectMakeZero()];
        
        [_titleField setLineBreakMode:CPLineBreakByTruncatingTail];
        [_titleField setAutoresizingMask:CPViewWidthSizable | CPViewMaxYMargin];
        [_titleField setFont:[CPFont boldSystemFontOfSize:11.0]];
        [_titleField setStringValue:@"Untitled"];
        
        [_titleField sizeToFit];
        
        var titleFieldHeight = CGRectGetHeight([_titleField frame]),
            x = MEDIA_THUMBNAIL_MAX_WIDTH + MEDIA_PREVIEW_MARGIN,
            y = 0.0;
        
        [_titleField setStringValue:@""];
        [_titleField setFrame:CGRectMake(x, y, fieldWidth, titleFieldHeight)];
        
        [self addSubview:_titleField];
        
        y += titleFieldHeight - 2.0;

        _sourceField = [[CPTextField alloc] initWithFrame:CGRectMake(x, y, 100.0, 18.0)];
        
        [_sourceField setFont:[CPFont systemFontOfSize:11.0]];
        [_sourceField setLineBreakMode:CPLineBreakByWordWrapping];
        [_sourceField setAutoresizingMask:CPViewWidthSizable | CPViewMaxYMargin];
        [_sourceField setTextColor:[CPColor grayColor]];
        
        [_sourceField setStringValue:@"12948 views"];
        
        [self addSubview:_sourceField];
        
        // Movie Duration Text Field
        
        _metaField = [[CPTextField alloc] initWithFrame:CGRectMake(x, y + 15.0, 100.0, 18.0)];
        
        [_metaField setAutoresizingMask:CPViewWidthSizable | CPViewMaxYMargin];
        [_metaField setLineBreakMode:CPLineBreakByTruncatingTail];
        [_metaField setFont:[CPFont boldSystemFontOfSize:11.0]];
        [_metaField setStringValue:@"53:53:40"];
        [_metaField setTextColor:[CPColor colorWithCalibratedRed:67.0 / 255.0 green:101.0 / 255.0 blue:183.0 / 255.0 alpha:1.0]];

        [self addSubview:_metaField];

        _descField = [[CPTextField alloc] initWithFrame:CGRectMake(x, y + 30.0, 100.0, 36.0)];
        
        [_descField setAutoresizingMask:CPViewWidthSizable | CPViewMaxYMargin];
        [_descField setLineBreakMode:CPLineBreakByWordWrapping];
        [_descField setFont:[CPFont boldSystemFontOfSize:11.0]];
        [_descField setStringValue:@"Description"];
        [_descField setTextColor:[CPColor grayColor]];
        
        [self addSubview:_descField];
    }
    
    return self;
}

- (void)setRepresentedObject:(Object)anObject
{
    if (_object == anObject)
        return;
    
    _object = anObject;
    
    [_titleField setStringValue:_object.title];
    [_sourceField setStringValue:_object.source];
	[_descField setStringValue: _object.description];

    if (_object.mediaType === MKMediaTypeVideo)
    {
        if (!_object.duration)
            [_metaField setStringValue:@""];
        else
        {
            var minutes = FLOOR(_object.duration / 60.0),
                seconds = _object.duration - minutes * 60.0;
            
            [_metaField setStringValue:((minutes < 10) ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds];
        }
    }
    else
    {
        if (!_object.contentSize)
            [_metaField setStringValue:@""]
        else
            [_metaField setStringValue:_object.contentSize.width + " x " + _object.contentSize.height];
    }
    
/*	if (_object.frame) {[_imageView setImageRect: CGRectMake(_object.frame.x, _object.frame.y, _object.frame.w, _object.frame.h)]};
	if (_object.animations) {
		var key = [Object.keys(_object.animations)[0]];
		var frame = _object.animations[key][0];
		[_imageView setContentRect: CGRectMake(frame.x, frame.y, frame.w, frame.h)];
	}
*/

    // We don't care about the process of this image any more.
    [_image setDelegate:nil];
    
    _image = [[CPImage alloc] initWithContentsOfFile:_object.thumbnailURL size:_object.thumbnailSize];

    if ([_image loadStatus] != CPImageLoadStatusCompleted)
    {
        [_image setDelegate:self];
        
        if (_object.thumbnailSize)
        {
            var center = [_imageView center];

            [_imageView setFrameSize:CGSizeMake(MIN(_object.thumbnailSize.width, MEDIA_THUMBNAIL_MAX_WIDTH), 
                                                MIN(_object.thumbnailSize.height, MEDIA_THUMBNAIL_MAX_HEIGHT))];

            [_imageView setCenter:center];
        }
        
		[_imageView setImageScaling: CPScaleProportionally];
        [_imageView setImage:nil];
    }
    else
        [self imageDidLoad:_image];
}

- (void)imageDidLoad:(CPImage)anImage
{
    if (_image != anImage)
        return;
    
    [_imageView setImage:_image];
    [_imageView setImageScaling:CPScaleProportionally];
    [_imageView setHasShadow:YES];
}

- (CGRect)selectionRect
{
    return CGRectInset([_imageView frame], -2.0, -2.0);
}

- (void)setSelected:(BOOL)shouldBeSelected
{
    if (shouldBeSelected)
    {
    }
    else
    {
    }
}

@end

var MediaCellImageViewKey       = @"MediaCellImageViewKey",
    MediaCellTitleFieldKey      = @"MediaCellTitleFieldKey",
    MediaCellSourceFieldKey     = @"MediaCellSourceFieldKey",
    MediaCellMetaFieldKey       = @"MediaCellMetaFieldKey";
    MediaCellDescFieldKey       = @"MediaCellDescFieldKey";

@implementation MKMediaCell (CPCoding)

- (id)initWithCoder:(CPCoder)aCoder
{
    self = [super initWithCoder:aCoder];
    
    if (self)
    {
        _imageView = [aCoder decodeObjectForKey:MediaCellImageViewKey];
        
        _titleField = [aCoder decodeObjectForKey:MediaCellTitleFieldKey];
        _sourceField = [aCoder decodeObjectForKey:MediaCellSourceFieldKey];
        _metaField = [aCoder decodeObjectForKey:MediaCellMetaFieldKey];
        _descField = [aCoder decodeObjectForKey:MediaCellDescFieldKey];
    }
    
    return self;
}

- (void)encodeWithCoder:(CPCoder)aCoder
{
    [super encodeWithCoder:aCoder];
    
    [aCoder encodeObject:_imageView forKey:MediaCellImageViewKey];
    
    [aCoder encodeObject:_titleField forKey:MediaCellTitleFieldKey];
    [aCoder encodeObject:_sourceField forKey:MediaCellSourceFieldKey];
    [aCoder encodeObject:_metaField forKey:MediaCellMetaFieldKey];
	[aCoder encodeObject:_descField forKey: MediaCellDescFieldKey];
}

@end
