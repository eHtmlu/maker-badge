<?php
/**
 * Plugin Name:       Maker Badge
 * Plugin URI:        https://makerbadge.eu/
 * Description:       Showcases your maker credentials on your website
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Helmut Wandl
 * Author URI:        https://ehtmlu.com/
 * License:           GPLv2
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       makerbadge
 */


add_action( 'admin_menu', function() {
    add_options_page(
        'Maker Badge', // Der Text, der in der Browser-Registerkarte angezeigt wird
        'Maker Badge', // Der Text, der im Menü angezeigt wird
        'manage_options', // Die erforderliche Benutzerberechtigung, um diese Seite zu sehen
        'makerbadge', // Der eindeutige ID-Name für diesen Menüpunkt
        function() {
            wp_enqueue_media();
            //wp_enqueue_editor_format_library_assets();
        
            wp_enqueue_script( 'makerbadge-settings', plugins_url( '/js/makerbadge.admin.js', __FILE__ ), array(
                'react',
                'react-dom',
                'wp-components',

                'media-upload',
                'media-models',
                'wp-mediaelement',
                'media-views',
                'media-editor',
        
                'wp-editor',
            ));
            wp_localize_script( 'makerbadge-settings', 'makerbadge', ['data' => json_decode(get_option('makerbadge_settings', '{}'))]);
        
            wp_enqueue_style( 'makerbadge-settings', plugins_url( '/css/makerbadge.admin.css', __FILE__ ), array(
                'wp-components',
                'wp-editor',
            ));
        
            echo '<h1>Maker Badge Settings</h1>';
            echo '<div id="makerbadgesettings"></div>';
        },
    );
});


add_action('init', function() {
    wp_enqueue_style('makerbadge', plugins_url( '/css/makerbadge.css', __FILE__ ), false, '1.0', 'all');

    add_action( 'wp_footer', function() {
        $data = json_decode(get_option('makerbadge_settings', '{}'));

        if (!isset($data->status) || (!isset($data->text) && !isset($data->image) && !isset($data->username)))
        {
            return;
        }
        
        echo '<' . (isset($data->url) ? 'a href="' . esc_attr($data->url) . '" target="_blank"' : 'div') . ' class="makerbadge status-' . $data->status . '">';
        echo isset($data->image) ? wp_get_attachment_image($data->image) : '';
        echo '<span>' . (isset($data->text) ? esc_html($data->text) : '') . (isset($data->username) ? ' <strong>' . esc_html($data->username) . '</strong>' : '') . '</span>';
        echo isset($data->url) ? '</a>' : '</div>';
    });
});


add_action('wp_ajax_makerbadge_save', function() {
    $data = stripslashes_deep($_POST['data']);
    update_option('makerbadge_settings', $data);
    echo get_option('makerbadge_settings', '{}');
    exit;
});

