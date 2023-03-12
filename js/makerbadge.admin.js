

document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('makerbadgesettings');

    const e = React.createElement;
    const wpe = wp.element.createElement;
    const wpc = wp.components;
    const wpbe = wp.blockEditor;

    
    const mediaUtils = {
        // Get MediaUpload from wp
        MediaUpload: wp.mediaUtils.MediaUpload,

        // Define custom MediaUploadCheck function (grabbed from here: https://github.com/WordPress/gutenberg/issues/40698 )
        MediaUploadCheck: function({children, fallback = null}) {
            const {
                checkingPermissions,
                hasUploadPermissions,
            } = wp.data.useSelect(select => {
                const core = select("core");
                return {
                    hasUploadPermissions: core.canUser("read", "media"),
                    checkingPermissions: !core.hasFinishedResolution("canUser", [ "read", "media"]),
                };
            });
    
            return checkingPermissions ? null : (hasUploadPermissions ? children : fallback);
        }
    };
    
    const { MediaUpload, MediaUploadCheck } = mediaUtils;

    function Image(props) {
        const media = wp.data.useSelect((select) => {
            return select('core').getMedia(props.mediaId);
        });
    
        const isImageSet = props.mediaId > 0;
        const isImageLoaded = isImageSet && media !== undefined;
    
        const attr = {...props};
        delete attr.mediaId;
    
        return React.createElement('img', {
            ...attr,
            ...(isImageLoaded ? {
                src: media.source_url
            } : {
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEHAAEALAAAAAABAAEAAAICTAEAOw=='
            })
        });
    }
    
    /* 
    Important Links about RichText:

    https://developer.wordpress.org/block-editor/how-to-guides/format-api/
    https://developer.wordpress.org/block-editor/reference-guides/packages/packages-rich-text/
     */
    wp.richText.registerFormatType( 'makerbadge/text-shadow', {
        //name: 'core/superscript',
        title: ( 'Text shadow' ),
        tagName: 'span',
        className: 'makerbadge-text-shadow',
        edit: ( props ) => {

            /**
             * Contains data about the Richtext content,
             * start and end pointers of the text selection.
             */
            const value = props.value;
        
            /**
             * The callback method to be called when the
             * format is applied or removed.
             */
            const onChange = props.onChange;
        
            /**
             * A boolean that determines if the format is
             * applied on the selected text. It's value changes
             * when applyFormat, removeFormat or toggleFormat
             * is called.
             * 
             * This value is not mandatory, but helpful to
             * highlight the ToolBar button that a formatting
             * option has been added.
             */
            const isActive = props.isActive;

            const onToggle = () => {
            alert('OK');
                /**
                 * toggleFormat accepts 2 arguments:
                 * RichTextValue: value
                 * RichTextFormat: format
                 */
                const toggledFormat = wp.richText.toggleFormat( value, {
                    type: 'my-namespace/text-shadow',
                } );

                onChange( toggledFormat );
            };
        
            return [
                wpe(wpbe.RichTextShortcut, {
                    type: "access",
					character: "m",
					onUse: onToggle
                }),
                wpe(wpbe.RichTextToolbarButton,
                    {
        
                        title: "Text shadow",
                        onClick: onToggle,
                        isActive: isActive
                    }
                )
            ];
        },
    } );
    

    function app() {
        const [data, setData] = React.useState(makerbadge?.data || {});
        const alertTitleField = React.useRef(null);

        React.useEffect(() => {
            jQuery.post(ajaxurl, {
                action: 'makerbadge_save',
                data: JSON.stringify(data)
            }, (response) => {
                //console.log(JSON.parse(response));
            });
        }, [data]);

        return e('div',
            null,
            wp.element.createElement(wp.components.SlotFillProvider,
                null,
                [
                    /* wpe(wpc.Slot, {name: 'BlockControls'}),
                    wpe(wpc.Slot, {name: 'BlockControlsBlock'}),
                    wpe(wpc.Slot, {name: 'BlockFormatControls'}),
                    wpe(wpc.Slot, {name: 'BlockControlsOther'}),
                    wpe(wpc.Slot, {name: 'BlockControlsParent'}),
                    wpe(wpc.Slot, {name: 'MainDashboardButton'}),
                    wpe(wpc.Slot, {name: 'PluginBlockSettingsMenuItem'}),
                    wpe(wpc.Slot, {name: 'PluginDocumentSettingPanel'}),
                    wpe(wpc.Slot, {name: 'PluginMoreMenuItem'}),
                    wpe(wpc.Slot, {name: 'PluginPostPublishPanel'}),
                    wpe(wpc.Slot, {name: 'PluginPostStatusInfo'}),
                    wpe(wpc.Slot, {name: 'PluginPrePublishPanel'}),
                    wpe(wpc.Slot, {name: 'PluginSidebar'}),
                    wpe(wpc.Slot, {name: 'PluginSidebarMoreMenuItem'}),
                    wpe(wpbe.RichText,
                        {
                            tagName: "p",
                            placeholder: 'Placeholder text',//__( 'Alert title', 'quotes-dlx' ),
                            value: data.text || '',
                            className: "alertx-dlx-title",
                            disableLineBreaks: true,
                            allowedFormats: [
                                'core/bold',
                                'core/italic',
                                'core/text-color',
                                'core/subscript',
                                'core/superscript',
                                'core/strikethrough',
                                'core/link',
                            ],
                            onChange: ( value ) => {
                                console.log(value);
                                //setAttributes( { alert_title: value } );
                            },
                            ref: alertTitleField,
                        }
                    ), */
                    wp.element.createElement(wpc.RadioControl, {
                        label: 'Status',
                        selected: data.status || '',
                        options: [
                            { label: 'off', value: '' },
                            { label: 'desktop only', value: 'desktop' },
                            { label: 'desktop and mobile', value: 'all' }
                        ],
                        onChange: ( value ) => {
                            const newData = {...data, status: value};
                            if (value === '') delete newData.status;
                            setData(newData);
                        }
                    }),
                    wp.element.createElement(wpc.TextControl, {
                        label: 'Text',
                        value: data.text || '',
                        placeholder: 'made by',
                        onChange: ( value ) => {
                            const newData = {...data, text: value};
                            if (value === '') delete newData.text;
                            setData(newData);
                        }
                    }),
                    wp.element.createElement(wpc.TextControl, {
                        label: 'Username',
                        value: data.username || '',
                        placeholder: '@username',
                        onChange: ( value ) => {
                            const newData = {...data, username: value};
                            if (value === '') delete newData.username;
                            setData(newData);
                        }
                    }),
                    wp.element.createElement(wpc.TextControl, {
                        label: 'URL',
                        value: data.url || '',
                        placeholder: 'https://twitter.com/username',
                        onChange: ( value ) => {
                            const newData = {...data, url: value};
                            if (value === '') delete newData.url;
                            setData(newData);
                        }
                    }),
                    e('div',
                        {
                            className: 'imagecontrol'
                        },
                        data.image ? React.createElement(Image,
                            {
                                mediaId: data.image || 0,
                                className: 'imagecontrol-image',
                            }
                        ) : e('div',
                            {
                                className: 'imagecontrol-image imagecontrol-image-placeholder',
                            },
                            'no image'
                        ),
                        e('div',
                            {
                                className: 'imagecontrol-controls'
                            },
                            wp.element.createElement(MediaUploadCheck,
                                {},
                                wp.element.createElement(MediaUpload,
                                    {
                                        onSelect: (media) => {
                                            if (media && media.id) {
                                                setData(Object.assign({}, data, {image: media.id}));
                                            }
                                        },
                                        value: data.image || 0,
                                        allowedTypes: ['image'],
                                        render: ({open}) => {
                                            return [
                                                wp.element.createElement(wp.components.Button,
                                                    {
                                                        variant: 'primary',
                                                        onClick: open,
                                                    },
                                                    data.image ? 'Change Image' : 'Set Image',
                                                )
                                            ];
                                        }
                                    }
                                )
                            ),
                            data.image ? wp.element.createElement(wp.components.Button,
                                {
                                    variant: 'tertiary',
                                    icon: e('svg', {xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24"}, e('path', {d:"M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z"})),
                                    'aria-label': 'Remove Image',
                                    title: 'Remove Image',
                                    onClick: () => {
                                        const newData = {...data};
                                        delete newData.image;
                                        setData(newData);
                                    }
                                },
                            ) : null
                        ),
                    ),
                ],
                wp.element.createElement(wp.components.Popover.Slot),
            ),

        );
    }


    ReactDOM.render(React.createElement(app), root);
});

